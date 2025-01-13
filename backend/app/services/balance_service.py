from fastapi import Request, HTTPException
from models.balance import Balance

async def create_balance(request: Request, new_balance: Balance):
    state = request.app.state.budget_state
    new_balance.id = state.current_balance_id
    state.balances[state.current_balance_id] = new_balance
    state.current_balance_id += 1
    return new_balance

async def retrieve_balance(request: Request, balance_id: int):
    state = request.app.state.budget_state
    if balance_id not in state.balances:
        raise HTTPException(status_code=404, detail="Balance not found")
    return state.balances[balance_id]
