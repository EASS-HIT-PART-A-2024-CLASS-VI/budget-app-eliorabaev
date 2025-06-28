from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime, timedelta
from fastapi import HTTPException
from db.models import User, LoginAttempt, Balance
from schemas.user import UserRegistration
from core.user_validation import validate_registration_data
from core.password_config import PasswordConfig
from core.password_hashing import PasswordHasher
import logging

logger = logging.getLogger(__name__)

def get_user_by_username(db: Session, username: str) -> User:
    """Get user by username"""
    return db.query(User).filter(User.username == username.lower()).first()

def get_user_by_email(db: Session, email: str) -> User:
    """Get user by email"""
    return db.query(User).filter(User.email == email.lower()).first()

def get_user_by_id(db: Session, user_id: int) -> User:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user_data: UserRegistration) -> User:
    """
    Create a new user with validation, password hashing, and auto-create initial balance
    """
    # Validate registration data
    validated_data = validate_registration_data(
        user_data.username,
        user_data.email, 
        user_data.password,
        user_data.password_confirmation
    )
    
    # Check if username already exists
    existing_user = get_user_by_username(db, validated_data["username"])
    if existing_user:
        raise HTTPException(status_code=409, detail="Username already registered")
    
    # Check if email already exists
    existing_email = get_user_by_email(db, validated_data["email"])
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Hash the password with PBKDF2 and unique salt
    hashed_password = PasswordHasher.hash_password(validated_data["password"])
    logger.info(f"Password hashed for user {validated_data['username']}")
    
    try:
        # Create new user with hashed password
        db_user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            password=hashed_password,
            is_active=True,
            is_verified=False
        )
        
        db.add(db_user)
        db.flush()  # Flush to get the user ID without committing
        
        # Auto-create initial balance with $0
        initial_balance = Balance(
            amount=0.0,
            user_id=db_user.id
        )
        
        db.add(initial_balance)
        db.commit()  # Commit both user and balance
        db.refresh(db_user)
        
        logger.info(f"New user created: {db_user.username} (ID: {db_user.id}) with initial balance")
        return db_user
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user {validated_data['username']}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create user account")



def get_failed_login_attempts(db: Session, user_id: int, since_minutes: int = None) -> int:
    """
    Get count of failed login attempts for a user within the specified time window
    """
    if since_minutes is None:
        since_minutes = PasswordConfig.LOCKOUT_DURATION_MINUTES
    
    cutoff_time = datetime.utcnow() - timedelta(minutes=since_minutes)
    
    return db.query(LoginAttempt).filter(
        and_(
            LoginAttempt.user_id == user_id,
            LoginAttempt.success == False,
            LoginAttempt.attempted_at >= cutoff_time
        )
    ).count()

def is_user_locked_out(db: Session, user_id: int) -> bool:
    """
    Check if user is currently locked out due to too many failed attempts
    """
    failed_attempts = get_failed_login_attempts(db, user_id)
    return failed_attempts >= PasswordConfig.MAX_LOGIN_ATTEMPTS

def record_login_attempt(db: Session, user_id: int, ip_address: str, success: bool) -> LoginAttempt:
    """
    Record a login attempt
    """
    login_attempt = LoginAttempt(
        user_id=user_id,
        ip_address=ip_address,
        success=success
    )
    
    db.add(login_attempt)
    db.commit()
    db.refresh(login_attempt)
    
    return login_attempt

def authenticate_user(db: Session, username_or_email: str, password: str, ip_address: str) -> User:
    """
    Authenticate user using PBKDF2 password verification
    """
    # Find user by username or email
    user = get_user_by_username(db, username_or_email)
    if not user:
        user = get_user_by_email(db, username_or_email)
    
    if not user:
        # Record failed attempt with a dummy user_id for security
        logger.warning(f"Login attempt for non-existent user: {username_or_email} from IP: {ip_address}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if user is locked out
    if is_user_locked_out(db, user.id):
        record_login_attempt(db, user.id, ip_address, False)
        logger.warning(f"Login attempt for locked account: {user.username} from IP: {ip_address}")
        raise HTTPException(
            status_code=429, 
            detail=f"Account locked due to too many failed attempts. Try again in {PasswordConfig.LOCKOUT_DURATION_MINUTES} minutes."
        )
    
    # Verify password using PBKDF2
    password_valid = False
    
    # Check if password is already hashed (for backward compatibility during migration)
    if PasswordHasher.is_password_hashed(user.password):
        # Use PBKDF2 verification
        password_valid = PasswordHasher.verify_password(password, user.password)
        logger.debug(f"PBKDF2 password verification for user {user.username}: {'success' if password_valid else 'failed'}")
    else:
        # Legacy plain text comparison (should not happen in production)
        password_valid = (user.password == password)
        logger.warning(f"Plain text password comparison for user {user.username} - password should be migrated to PBKDF2")
        
        # Auto-migrate to hashed password on successful login
        if password_valid:
            logger.info(f"Auto-migrating password to PBKDF2 for user {user.username}")
            user.password = PasswordHasher.hash_password(password)
            db.commit()
    
    if not password_valid:
        record_login_attempt(db, user.id, ip_address, False)
        failed_attempts = get_failed_login_attempts(db, user.id)
        
        logger.warning(f"Failed login attempt for user {user.username} from IP: {ip_address} (attempt {failed_attempts}/{PasswordConfig.MAX_LOGIN_ATTEMPTS})")
        
        if failed_attempts >= PasswordConfig.MAX_LOGIN_ATTEMPTS:
            logger.warning(f"Account locked for user {user.username} after {failed_attempts} failed attempts")
            raise HTTPException(
                status_code=429,
                detail=f"Account locked due to too many failed attempts. Try again in {PasswordConfig.LOCKOUT_DURATION_MINUTES} minutes."
            )
        
        remaining_attempts = PasswordConfig.MAX_LOGIN_ATTEMPTS - failed_attempts
        raise HTTPException(
            status_code=401, 
            detail=f"Invalid credentials. {remaining_attempts} attempts remaining."
        )
    
    # Check if user is active
    if not user.is_active:
        record_login_attempt(db, user.id, ip_address, False)
        logger.warning(f"Login attempt for deactivated account: {user.username} from IP: {ip_address}")
        raise HTTPException(status_code=401, detail="Account is deactivated")
    
    # Successful login
    record_login_attempt(db, user.id, ip_address, True)
    logger.info(f"Successful login for user {user.username} from IP: {ip_address}")
    return user

def migrate_plain_text_passwords(db: Session) -> int:
    """
    Migrate any existing plain text passwords to PBKDF2 hashes
    This should be run once during deployment
    
    Returns:
        Number of passwords migrated
    """
    migrated_count = 0
    
    try:
        # Find users with plain text passwords
        users = db.query(User).all()
        
        for user in users:
            if not PasswordHasher.is_password_hashed(user.password):
                # This is a plain text password, hash it
                logger.info(f"Migrating plain text password for user {user.username}")
                user.password = PasswordHasher.hash_password(user.password)
                migrated_count += 1
        
        if migrated_count > 0:
            db.commit()
            logger.info(f"Successfully migrated {migrated_count} plain text passwords to PBKDF2")
        else:
            logger.info("No plain text passwords found to migrate")
            
    except Exception as e:
        logger.error(f"Error during password migration: {str(e)}")
        db.rollback()
        raise
    
    return migrated_count