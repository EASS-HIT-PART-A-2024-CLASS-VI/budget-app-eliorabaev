# backend/app/routers/expense.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import crud
from db.database import get_db
from schemas.balance import Expense, ExpenseCreate, ExpenseUpdate
from core.auth_dependencies import get_current_user
from db.models import User

router = APIRouter()

@router.post("/", response_model=Expense)
async def create_expense_endpoint(
    expense: ExpenseCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Create a new expense (user must be authenticated)"""
    return crud.expense.create_expense(db, expense)

@router.get("/{expense_id}", response_model=Expense)
async def get_expense_endpoint(
    expense_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Get an expense by ID (user must be authenticated)"""
    db_expense = crud.expense.get_expense(db, expense_id)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if db_expense.balance.user_id and db_expense.balance.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return db_expense

@router.get("/", response_model=List[Expense])
async def get_all_expenses_endpoint(
    balance_id: Optional[int] = Query(None, description="Filter expenses by balance ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Get all expenses (user must be authenticated)"""
    if balance_id:
        balance = crud.balance.get_balance(db, balance_id)
        if balance and balance.user_id and balance.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return crud.expense.get_expenses_by_balance(db, balance_id)
    
    return crud.expense.get_all_expenses(db, skip, limit)

@router.patch("/{expense_id}", response_model=Expense)
async def update_expense_endpoint(
    expense_id: int, 
    expense: ExpenseUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Update an expense (user must be authenticated)"""
    existing_expense = crud.expense.get_expense(db, expense_id)
    if existing_expense and existing_expense.balance.user_id and existing_expense.balance.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db_expense = crud.expense.update_expense(db, expense_id, expense)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense

@router.delete("/{expense_id}", status_code=204)
async def delete_expense_endpoint(
    expense_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Delete an expense (user must be authenticated)"""
    existing_expense = crud.expense.get_expense(db, expense_id)
    if existing_expense and existing_expense.balance.user_id and existing_expense.balance.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    success = crud.expense.delete_expense(db, expense_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"status": "success"}

# Optional: Public endpoint for health check (no authentication required)
@router.get("/public/health")
async def health_check():
    """Public health check endpoint (no authentication required)"""
    return {"status": "healthy", "service": "expense"}