from fastapi import Depends, HTTPException, Path, Query
from typing import Optional
from core.validation import validate_id

def validate_balance_id(
    balance_id: int = Path(..., gt=0, description="The ID of the balance to get")
) -> int:
    """Validate that the balance_id path parameter is valid."""
    return balance_id

def validate_pagination(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0, le=500)
) -> tuple:
    """Validate pagination parameters."""
    return (skip, limit)

def validate_balance_id_query(
    balance_id: Optional[int] = Query(None, gt=0)
) -> Optional[int]:
    """Validate that the balance_id query parameter is valid if provided."""
    return balance_id