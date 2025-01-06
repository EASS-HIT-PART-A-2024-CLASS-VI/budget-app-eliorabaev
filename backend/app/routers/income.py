from fastapi import APIRouter, HTTPException, Request
from models.balance import Income
from typing import List

router = APIRouter()  # Create a new API router

@router.post("/", response_model=Income)
async def add_income(request: Request, income: Income):
    # Add a new income
    current_income_id = request.app.state.budget_state.current_income_id
    if income.balance_id not in request.app.state.budget_state.balances: # Check if the associated balance exists
        raise HTTPException(status_code=404, detail="Associated balance not found")

    income.id = current_income_id
    request.app.state.budget_state.incomes[current_income_id] = income
    request.app.state.budget_state.current_income_id += 1
    return income

@router.get("/{income_id}", response_model=Income)
async def get_income(request: Request, income_id: int):
    # Get an income by ID
    incomes = request.app.state.budget_state.incomes
    if income_id not in incomes:
        raise HTTPException(status_code=404, detail="Income not found")
    return incomes[income_id]

@router.get("/", response_model=List[Income])
async def get_incomes(request: Request):
    # Get all incomes
    return list(request.app.state.budget_state.incomes.values())
