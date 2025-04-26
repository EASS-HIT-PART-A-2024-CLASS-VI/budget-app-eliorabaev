from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import crud
from db.database import get_db
from schemas.balance import Income, IncomeCreate, IncomeUpdate

router = APIRouter()

@router.post("/", response_model=Income)
async def create_income_endpoint(income: IncomeCreate, db: Session = Depends(get_db)):
    return crud.income.create_income(db, income)

@router.get("/{income_id}", response_model=Income)
async def get_income_endpoint(income_id: int, db: Session = Depends(get_db)):
    db_income = crud.income.get_income(db, income_id)
    if db_income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return db_income

@router.get("/", response_model=List[Income])
async def get_all_incomes_endpoint(
    balance_id: Optional[int] = Query(None, description="Filter incomes by balance ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    if balance_id:
        return crud.income.get_incomes_by_balance(db, balance_id)
    return crud.income.get_all_incomes(db, skip, limit)

@router.patch("/{income_id}", response_model=Income)
async def update_income_endpoint(income_id: int, income: IncomeUpdate, db: Session = Depends(get_db)):
    db_income = crud.income.update_income(db, income_id, income)
    if db_income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return db_income

@router.delete("/{income_id}", status_code=204)
async def delete_income_endpoint(income_id: int, db: Session = Depends(get_db)):
    success = crud.income.delete_income(db, income_id)
    if not success:
        raise HTTPException(status_code=404, detail="Income not found")
    return {"status": "success"}