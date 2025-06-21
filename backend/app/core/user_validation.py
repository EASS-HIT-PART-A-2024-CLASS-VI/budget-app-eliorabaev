import re
from typing import Optional
from fastapi import HTTPException
from core.password_config import PasswordConfig

def validate_username(username: str) -> str:
    """
    Validate username format - only letters and numbers allowed
    """
    if not username:
        raise HTTPException(status_code=422, detail="Username cannot be empty")
    
    if len(username) < 3:
        raise HTTPException(status_code=422, detail="Username must be at least 3 characters long")
    
    if len(username) > 30:
        raise HTTPException(status_code=422, detail="Username cannot exceed 30 characters")
    
    # Only alphanumeric characters allowed
    if not re.match(r'^[a-zA-Z0-9]+$', username):
        raise HTTPException(
            status_code=422, 
            detail="Username can only contain letters and numbers"
        )
    
    return username.lower()

def validate_email(email: str) -> str:
    """
    Validate email format using regex
    """
    if not email:
        raise HTTPException(status_code=422, detail="Email cannot be empty")
    
    # Basic email validation regex
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_pattern, email):
        raise HTTPException(status_code=422, detail="Invalid email format")
    
    if len(email) > 255:
        raise HTTPException(status_code=422, detail="Email address too long")
    
    return email.lower()

def validate_password(password: str) -> str:
    """
    Validate password according to password config requirements
    """
    if not password:
        raise HTTPException(status_code=422, detail="Password cannot be empty")
    
    # Check length
    if len(password) < PasswordConfig.MIN_LENGTH:
        raise HTTPException(
            status_code=422, 
            detail=f"Password must be at least {PasswordConfig.MIN_LENGTH} characters long"
        )
    
    if len(password) > PasswordConfig.MAX_LENGTH:
        raise HTTPException(
            status_code=422, 
            detail=f"Password cannot exceed {PasswordConfig.MAX_LENGTH} characters"
        )
    
    # Check for common passwords
    if PasswordConfig.is_common_password(password):
        raise HTTPException(
            status_code=422, 
            detail="This password is too common. Please choose a different password."
        )
    
    # Check character requirements
    errors = []
    
    if PasswordConfig.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
        errors.append("at least one uppercase letter")
    
    if PasswordConfig.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
        errors.append("at least one lowercase letter")
    
    if PasswordConfig.REQUIRE_NUMBERS and not re.search(r'\d', password):
        errors.append("at least one number")
    
    if PasswordConfig.REQUIRE_SPECIAL_CHARS and not re.search(f'[{re.escape(PasswordConfig.SPECIAL_CHARS)}]', password):
        errors.append(f"at least one special character ({PasswordConfig.SPECIAL_CHARS})")
    
    if errors:
        error_message = f"Password must contain {', '.join(errors)}"
        raise HTTPException(status_code=422, detail=error_message)
    
    return password

def validate_password_confirmation(password: str, password_confirmation: str) -> None:
    """
    Validate that password and password confirmation match
    """
    if password != password_confirmation:
        raise HTTPException(status_code=422, detail="Passwords do not match")

def validate_registration_data(username: str, email: str, password: str, password_confirmation: str) -> dict:
    """
    Validate all registration data and return cleaned values
    """
    # Validate each field
    clean_username = validate_username(username)
    clean_email = validate_email(email)
    clean_password = validate_password(password)
    validate_password_confirmation(password, password_confirmation)
    
    return {
        "username": clean_username,
        "email": clean_email,
        "password": clean_password
    }