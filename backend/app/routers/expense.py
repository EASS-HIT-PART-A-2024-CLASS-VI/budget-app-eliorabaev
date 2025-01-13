from fastapi import APIRouter, Request
from models.balance import Expense
from typing import List
from core.utils import get_balance_or_404
from services.expense_service import add_expense, get_expense_by_id, get_all_expenses

router = APIRouter()

@router.post("/", response_model=Expense)
async def create_expense(request: Request, expense: Expense):
    budget_state = request.app.state.budget_state
    get_balance_or_404(budget_state, expense.balance_id)  # Validate balance ID
    return await add_expense(request, expense)

@router.get("/{expense_id}", response_model=Expense)
async def retrieve_expense(request: Request, expense_id: int):
    return await get_expense_by_id(request, expense_id)

@router.get("/", response_model=List[Expense])
async def retrieve_all_expenses(request: Request):
    return await get_all_expenses(request)
