from fastapi import Request, HTTPException
from models.balance import Expense, UpdateExpense
from typing import List

async def add_expense(request: Request, expense: Expense):
    state = request.app.state.budget_state
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

async def update_expense(request: Request, expense_id: int, updated_expense: UpdateExpense):
    budget_state = request.app.state.budget_state

    if expense_id not in budget_state.expenses:
        raise HTTPException(status_code=404, detail="Expense not found")

    expense = budget_state.expenses[expense_id]

    # Update fields only if they are provided
    if updated_expense.balance_id is not None:
        expense.balance_id = updated_expense.balance_id
    if updated_expense.category is not None:
        expense.category = updated_expense.category
    if updated_expense.amount is not None:
        expense.amount = updated_expense.amount

    budget_state.expenses[expense_id] = expense
    return expense

async def delete_expense(request: Request, expense_id: int):
    budget_state = request.app.state.budget_state

    if expense_id not in budget_state.expenses:
        raise HTTPException(status_code=404, detail="Expense not found")

    del budget_state.expenses[expense_id]
