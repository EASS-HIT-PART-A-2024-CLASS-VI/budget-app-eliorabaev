from fastapi import Request, HTTPException
from models.balance import Expense
from typing import List

async def add_expense(request: Request, expense: Expense):
    state = request.app.state.budget_state
    if expense.balance_id not in state.balances:
        raise HTTPException(status_code=404, detail="Associated balance not found")

    expense.id = state.current_expense_id
    state.expenses[state.current_expense_id] = expense
    state.current_expense_id += 1
    return expense

async def get_expense_by_id(request: Request, expense_id: int):
    state = request.app.state.budget_state
    if expense_id not in state.expenses:
        raise HTTPException(status_code=404, detail="Expense not found")
    return state.expenses[expense_id]

async def get_all_expenses(request: Request) -> List[Expense]:
    state = request.app.state.budget_state
    return list(state.expenses.values())
