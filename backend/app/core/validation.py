from fastapi import HTTPException
from typing import Dict, Any, List, Optional
import re
import unicodedata
from pydantic import ValidationError

def validate_positive_amount(amount: float, field_name: str = "amount"):
    """Validate that an amount is positive."""
    if amount is None:
        raise HTTPException(status_code=422, detail=f"{field_name} cannot be None")
    if not isinstance(amount, (int, float)):
        raise HTTPException(status_code=422, detail=f"{field_name} must be a number")
    if amount <= 0:
        raise HTTPException(status_code=422, detail=f"{field_name} must be greater than zero")
    return amount

def sanitize_string(value: str, field_name: str = "field", max_length: int = 255) -> str:
    """Sanitize a string input to prevent injection attacks."""
    if value is None:
        raise HTTPException(status_code=422, detail=f"{field_name} cannot be None")
    if not isinstance(value, str):
        raise HTTPException(status_code=422, detail=f"{field_name} must be a string")
    
    # Trim whitespace
    value = value.strip()
    
    # Check length
    if len(value) == 0:
        raise HTTPException(status_code=422, detail=f"{field_name} cannot be empty")
    if len(value) > max_length:
        raise HTTPException(status_code=422, detail=f"{field_name} cannot exceed {max_length} characters")
    
    # Remove control characters
    value = ''.join(ch for ch in value if unicodedata.category(ch)[0] != 'C')
    
    # Simple pattern for alphanumeric with common punctuation
    if not re.match(r'^[a-zA-Z0-9\s\.,_\-\'\"]+$', value):
        raise HTTPException(status_code=422, detail=f"{field_name} contains invalid characters")
    
    return value

def validate_id(id_value: int, field_name: str = "id"):
    """Validate that an ID is a positive integer."""
    if id_value is None:
        raise HTTPException(status_code=422, detail=f"{field_name} cannot be None")
    if not isinstance(id_value, int):
        raise HTTPException(status_code=422, detail=f"{field_name} must be an integer")
    if id_value <= 0:
        raise HTTPException(status_code=422, detail=f"{field_name} must be greater than zero")
    return id_value

def validate_request_data(data: Dict[str, Any], required_fields: List[str]):
    """Validate that all required fields are present in the request data."""
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]
    if missing_fields:
        raise HTTPException(status_code=422, detail=f"Missing required fields: {', '.join(missing_fields)}")
    return data