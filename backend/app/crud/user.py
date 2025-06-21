from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime, timedelta
from fastapi import HTTPException
from db.models import User, LoginAttempt
from schemas.user import UserRegistration
from core.user_validation import validate_registration_data
from core.password_config import PasswordConfig

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
    Create a new user with validation
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
    
    # Create new user (storing password as plain text for now)
    db_user = User(
        username=validated_data["username"],
        email=validated_data["email"],
        password=validated_data["password"],  # Plain text for now
        is_active=True,
        is_verified=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

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
    Authenticate user and handle login attempts
    For now, this uses plain text password comparison
    """
    # Find user by username or email
    user = get_user_by_username(db, username_or_email)
    if not user:
        user = get_user_by_email(db, username_or_email)
    
    if not user:
        # Record failed attempt with a dummy user_id for security
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if user is locked out
    if is_user_locked_out(db, user.id):
        record_login_attempt(db, user.id, ip_address, False)
        raise HTTPException(
            status_code=429, 
            detail=f"Account locked due to too many failed attempts. Try again in {PasswordConfig.LOCKOUT_DURATION_MINUTES} minutes."
        )
    
    # Check password (plain text comparison for now)
    if user.password != password:
        record_login_attempt(db, user.id, ip_address, False)
        failed_attempts = get_failed_login_attempts(db, user.id)
        
        if failed_attempts >= PasswordConfig.MAX_LOGIN_ATTEMPTS:
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
        raise HTTPException(status_code=401, detail="Account is deactivated")
    
    # Successful login
    record_login_attempt(db, user.id, ip_address, True)
    return user
