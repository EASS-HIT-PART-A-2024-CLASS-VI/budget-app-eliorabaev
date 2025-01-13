from fastapi import APIRouter, Request
from models.balance import Balance
from services.balance_service import create_balance, retrieve_balance, update_balance, delete_balance

router = APIRouter()

@router.post("/", response_model=Balance)
async def set_balance(request: Request, new_balance: Balance):
    return await create_balance(request, new_balance)

@router.get("/{balance_id}", response_model=Balance)
async def get_balance(request: Request, balance_id: int):
    return await retrieve_balance(request, balance_id)

@router.patch("/{balance_id}", response_model=Balance)
async def patch_balance_endpoint(request: Request, balance_id: int, updated_balance: Balance):
    return await update_balance(request, balance_id, updated_balance)

@router.delete("/{balance_id}", status_code=204)
async def delete_balance_endpoint(request: Request, balance_id: int):
    await delete_balance(request, balance_id)