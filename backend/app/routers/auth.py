from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Dict

import crud
from db.database import get_db
from schemas.user import UserRegistration, UserResponse, UserLogin
from core.password_config import PasswordConfig

router = APIRouter()

def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    if "x-forwarded-for" in request.headers:
        return request.headers["x-forwarded-for"].split(",")[0].strip()
    elif "x-real-ip" in request.headers:
        return request.headers["x-real-ip"]
    else:
        return request.client.host

@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(
    user_data: UserRegistration, 
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Register a new user with comprehensive validation
    """
    try:
        # Create the user
        user = crud.user.create_user(db, user_data)
        
        # Log the successful registration
        client_ip = get_client_ip(request)
        print(f"New user registered: {user.username} from IP {client_ip}")
        
        return user
    
    except HTTPException:
        # Re-raise HTTPException from validation or CRUD
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/login")
async def login_user(
    login_data: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Authenticate user login with rate limiting
    """
    try:
        client_ip = get_client_ip(request)
        
        # Authenticate user
        user = crud.user.authenticate_user(
            db, 
            login_data.username_or_email, 
            login_data.password,
            client_ip
        )
        
        # In a real application, you would generate a JWT token here
        return {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }
    
    except HTTPException:
        # Re-raise HTTPException from authentication
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail="Login failed")

@router.get("/password-requirements")
async def get_password_requirements():
    """
    Get password requirements for the frontend
    """
    return {
        "requirements": PasswordConfig.get_password_requirements_message(),
        "min_length": PasswordConfig.MIN_LENGTH,
        "max_length": PasswordConfig.MAX_LENGTH,
        "require_uppercase": PasswordConfig.REQUIRE_UPPERCASE,
        "require_lowercase": PasswordConfig.REQUIRE_LOWERCASE,
        "require_numbers": PasswordConfig.REQUIRE_NUMBERS,
        "require_special_chars": PasswordConfig.REQUIRE_SPECIAL_CHARS,
        "special_chars": PasswordConfig.SPECIAL_CHARS,
        "max_login_attempts": PasswordConfig.MAX_LOGIN_ATTEMPTS,
        "lockout_duration_minutes": PasswordConfig.LOCKOUT_DURATION_MINUTES
    }

@router.get("/check-username/{username}")
async def check_username_availability(username: str, db: Session = Depends(get_db)):
    """
    Check if username is available
    """
    try:
        from core.user_validation import validate_username
        clean_username = validate_username(username)
        
        existing_user = crud.user.get_user_by_username(db, clean_username)
        return {
            "available": existing_user is None,
            "username": clean_username
        }
    except HTTPException as e:
        return {
            "available": False,
            "error": e.detail
        }

@router.get("/check-email/{email}")
async def check_email_availability(email: str, db: Session = Depends(get_db)):
    """
    Check if email is available
    """
    try:
        from core.user_validation import validate_email
        clean_email = validate_email(email)
        
        existing_user = crud.user.get_user_by_email(db, clean_email)
        return {
            "available": existing_user is None,
            "email": clean_email
        }
    except HTTPException as e:
        return {
            "available": False,
            "error": e.detail
        }
