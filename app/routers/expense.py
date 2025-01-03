from fastapi import APIRouter, HTTPException, Request
from models.balance import Expense
from typing import List

router = APIRouter()  # Create a new API router

@router.post("/", response_model=Expense)
async def add_expense(request: Request, expense: Expense):
    # Add a new expense
    current_expense_id = request.app.state.budget_state.current_expense_id
    if expense.balance_id not in request.app.state.budget_state.balances: # Check if the associated balance exists
        raise HTTPException(status_code=404, detail="Associated balance not found")

    expense.id = current_expense_id
    request.app.state.budget_state.expenses[current_expense_id] = expense
    request.app.state.budget_state.current_expense_id += 1
    return expense

@router.get("/{expense_id}", response_model=Expense)
async def get_expense(request: Request, expense_id: int):
    # Get an expense by ID
    expenses = request.app.state.budget_state.expenses
    if expense_id not in expenses:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expenses[expense_id]

@router.get("/", response_model=List[Expense])
async def get_expenses(request: Request):
    # Get all expenses
    return list(request.app.state.budget_state.expenses.values())
