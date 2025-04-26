from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import crud
from db.database import get_db
from schemas.balance import Expense, ExpenseCreate, ExpenseUpdate

router = APIRouter()

@router.post("/", response_model=Expense)
async def create_expense_endpoint(expense: ExpenseCreate, db: Session = Depends(get_db)):
    return crud.expense.create_expense(db, expense)

@router.get("/{expense_id}", response_model=Expense)
async def get_expense_endpoint(expense_id: int, db: Session = Depends(get_db)):
    db_expense = crud.expense.get_expense(db, expense_id)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense

@router.get("/", response_model=List[Expense])
async def get_all_expenses_endpoint(
    balance_id: Optional[int] = Query(None, description="Filter expenses by balance ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    if balance_id:
        return crud.expense.get_expenses_by_balance(db, balance_id)
    return crud.expense.get_all_expenses(db, skip, limit)

@router.patch("/{expense_id}", response_model=Expense)
async def update_expense_endpoint(expense_id: int, expense: ExpenseUpdate, db: Session = Depends(get_db)):
    db_expense = crud.expense.update_expense(db, expense_id, expense)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense

@router.delete("/{expense_id}", status_code=204)
async def delete_expense_endpoint(expense_id: int, db: Session = Depends(get_db)):
    success = crud.expense.delete_expense(db, expense_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"status": "success"}