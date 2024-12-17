from fastapi import APIRouter, HTTPException
from models.balance import Balance
from shared_data import balances
from typing import Dict

router = APIRouter()
current_balance_id = 1

@router.post("/", response_model=Balance)
async def set_balance(new_balance: Balance):
    global current_balance_id
    new_balance.id = current_balance_id
    balances[current_balance_id] = new_balance
    current_balance_id += 1
    return new_balance

@router.get("/{balance_id}", response_model=Balance)
async def get_balance(balance_id: int):
    if balance_id not in balances:
        raise HTTPException(status_code=404, detail="Balance not found")
    return balances[balance_id]
