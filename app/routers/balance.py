from fastapi import APIRouter, HTTPException, Request
from models.balance import Balance
from typing import Dict

router = APIRouter()  # Create a new API router

@router.post("/", response_model=Balance)
async def set_balance(request: Request, new_balance: Balance):
    # Set a new balance
    current_balance_id = request.app.state.budget_state.current_balance_id
    new_balance.id = current_balance_id
    request.app.state.budget_state.balances[current_balance_id] = new_balance
    request.app.state.budget_state.current_balance_id += 1
    return new_balance

@router.get("/{balance_id}", response_model=Balance)
async def get_balance(request: Request, balance_id: int):
    # Get a balance by ID
    balances = request.app.state.budget_state.balances
    if balance_id not in balances:
        raise HTTPException(status_code=404, detail="Balance not found")
    return balances[balance_id]
