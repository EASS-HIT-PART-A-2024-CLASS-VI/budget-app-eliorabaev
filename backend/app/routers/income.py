from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import crud
from db.database import get_db
from schemas.balance import Income, IncomeCreate, IncomeUpdate
from core.auth_dependencies import get_current_user
from db.models import User

router = APIRouter()

@router.post("/", response_model=Income)
async def create_income_endpoint(
    income: IncomeCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Create a new income (user must be authenticated)"""
    return crud.income.create_income(db, income)

@router.get("/{income_id}", response_model=Income)
async def get_income_endpoint(
    income_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Get an income by ID (user must be authenticated)"""
    db_income = crud.income.get_income(db, income_id)
    if db_income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    
    if db_income.balance.user_id and db_income.balance.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return db_income

@router.get("/", response_model=List[Income])
async def get_all_incomes_endpoint(
    balance_id: Optional[int] = Query(None, description="Filter incomes by balance ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Get all incomes (user must be authenticated)"""
    if balance_id:
        balance = crud.balance.get_balance(db, balance_id)
        if balance and balance.user_id and balance.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return crud.income.get_incomes_by_balance(db, balance_id)
    
    return crud.income.get_all_incomes(db, skip, limit)

@router.patch("/{income_id}", response_model=Income)
async def update_income_endpoint(
    income_id: int, 
    income: IncomeUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Update an income (user must be authenticated)"""
    existing_income = crud.income.get_income(db, income_id)
    if existing_income and existing_income.balance.user_id and existing_income.balance.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db_income = crud.income.update_income(db, income_id, income)
    if db_income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return db_income

@router.delete("/{income_id}", status_code=204)
async def delete_income_endpoint(
    income_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Delete an income (user must be authenticated)"""
    existing_income = crud.income.get_income(db, income_id)
    if existing_income and existing_income.balance.user_id and existing_income.balance.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    success = crud.income.delete_income(db, income_id)
    if not success:
        raise HTTPException(status_code=404, detail="Income not found")
    return {"status": "success"}

@router.get("/public/health")
async def health_check():
    """Public health check endpoint (no authentication required)"""
    return {"status": "healthy", "service": "income"}