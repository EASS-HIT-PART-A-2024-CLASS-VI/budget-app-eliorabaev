from fastapi import APIRouter, HTTPException
from models.balance import Income
from typing import List
from shared_data import balances, incomes

router = APIRouter()
current_income_id = 1

@router.post("/", response_model=Income)
async def add_income(income: Income):
    global current_income_id
    if income.balance_id not in balances:
        raise HTTPException(status_code=404, detail="Associated balance not found")
    
    income.id = current_income_id
    incomes[current_income_id] = income
    current_income_id += 1
    return income

@router.get("/{income_id}", response_model=Income)
async def get_income(income_id: int):
    if income_id not in incomes:
        raise HTTPException(status_code=404, detail="Income not found")
    return incomes[income_id]

@router.get("/", response_model=List[Income])
async def get_incomes():
    return list(incomes.values())
