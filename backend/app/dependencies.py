from fastapi import Path, Query, Depends
from typing import Optional, Tuple

def validate_balance_id(
    balance_id: int = Path(..., gt=0, description="The ID of the balance")
) -> int:
    """Validate that the balance_id path parameter is valid."""
    return balance_id

def validate_income_id(
    income_id: int = Path(..., gt=0, description="The ID of the income")
) -> int:
    """Validate that the income_id path parameter is valid."""
    return income_id

def validate_expense_id(
    expense_id: int = Path(..., gt=0, description="The ID of the expense")
) -> int:
    """Validate that the expense_id path parameter is valid."""
    return expense_id

def validate_pagination(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, gt=0, le=500, description="Maximum number of items to return")
) -> Tuple[int, int]:
    """Validate pagination parameters."""
    return skip, limit

def validate_balance_id_query(
    balance_id: Optional[int] = Query(None, gt=0, description="Filter by balance ID")
) -> Optional[int]:
    """Validate that the balance_id query parameter is valid if provided."""
    return balance_id