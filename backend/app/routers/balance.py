from fastapi import APIRouter, Request
from models.balance import Balance
from services.balance_service import create_balance, retrieve_balance

router = APIRouter()

@router.post("/", response_model=Balance)
async def set_balance(request: Request, new_balance: Balance):
    return await create_balance(request, new_balance)

@router.get("/{balance_id}", response_model=Balance)
async def get_balance(request: Request, balance_id: int):
    return await retrieve_balance(request, balance_id)
