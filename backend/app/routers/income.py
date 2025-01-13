from fastapi import APIRouter, Request
from models.balance import Income
from typing import List
from core.utils import get_balance_or_404
from services.income_service import add_income, get_income_by_id, get_all_incomes

router = APIRouter()

@router.post("/", response_model=Income)
async def create_income(request: Request, income: Income):
    budget_state = request.app.state.budget_state
    get_balance_or_404(budget_state, income.balance_id)  # Validate balance ID
    return await add_income(request, income)

@router.get("/{income_id}", response_model=Income)
async def retrieve_income(request: Request, income_id: int):
    return await get_income_by_id(request, income_id)

@router.get("/", response_model=List[Income])
async def retrieve_all_incomes(request: Request):
    return await get_all_incomes(request)
