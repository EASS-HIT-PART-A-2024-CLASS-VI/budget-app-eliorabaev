from fastapi import Request, HTTPException
from models.balance import Income, UpdateIncome
from typing import List

async def add_income(request: Request, income: Income):
    state = request.app.state.budget_state
    income.id = state.current_income_id
    state.incomes[state.current_income_id] = income
    state.current_income_id += 1
    return income

async def get_income_by_id(request: Request, income_id: int):
    state = request.app.state.budget_state
    if income_id not in state.incomes:
        raise HTTPException(status_code=404, detail="Income not found")
    return state.incomes[income_id]

async def get_all_incomes(request: Request) -> List[Income]:
    state = request.app.state.budget_state
    return list(state.incomes.values())

async def update_income(request: Request, income_id: int, updated_income: UpdateIncome):
    budget_state = request.app.state.budget_state

    if income_id not in budget_state.incomes:
        raise HTTPException(status_code=404, detail="Income not found")

    income = budget_state.incomes[income_id]

    # Update fields only if they are provided
    if updated_income.balance_id is not None:
        income.balance_id = updated_income.balance_id
    if updated_income.source is not None:
        income.source = updated_income.source
    if updated_income.amount is not None:
        income.amount = updated_income.amount

    budget_state.incomes[income_id] = income
    return income

async def delete_income(request: Request, income_id: int):
    budget_state = request.app.state.budget_state

    if income_id not in budget_state.incomes:
        raise HTTPException(status_code=404, detail="Income not found")

    del budget_state.incomes[income_id]