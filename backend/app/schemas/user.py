from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class UserRegistration(BaseModel):
    username: str = Field(
        min_length=3, 
        max_length=30, 
        description="Username containing only letters and numbers"
    )
    email: str = Field(
        max_length=255, 
        description="Valid email address"
    )
    password: str = Field(
        min_length=8, 
        max_length=64, 
        description="Password meeting security requirements"
    )
    password_confirmation: str = Field(
        min_length=8, 
        max_length=64, 
        description="Password confirmation must match password"
    )

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username_or_email: str = Field(
        description="Username or email address"
    )
    password: str = Field(
        description="User password"
    )

class LoginAttemptResponse(BaseModel):
    id: int
    user_id: int
    ip_address: str
    attempted_at: datetime
    success: bool
    
    class Config:
        from_attributes = True