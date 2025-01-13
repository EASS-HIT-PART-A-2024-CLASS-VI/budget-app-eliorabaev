from fastapi import Request, HTTPException
from models.balance import Income
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
