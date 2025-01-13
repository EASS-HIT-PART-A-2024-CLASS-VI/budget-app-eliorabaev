from fastapi import Request, HTTPException
from models.balance import Balance
from core.utils import get_balance_or_404

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

async def update_balance(request: Request, balance_id: int, updated_balance: Balance):
    budget_state = request.app.state.budget_state  # Access the app state
    balance = get_balance_or_404(budget_state, balance_id)  # Ensure the balance exists

    balance.amount = updated_balance.amount
    budget_state.balances[balance_id] = balance  # Save the updated balance

    return balance  # Return the updated balance

async def delete_balance(request: Request, balance_id: int):
    budget_state = request.app.state.budget_state  # Access the app state
    get_balance_or_404(budget_state, balance_id)
    
    del budget_state.balances[balance_id]
    budget_state.incomes = {k: v for k, v in budget_state.incomes.items() if v.balance_id != balance_id}
    budget_state.expenses = {k: v for k, v in budget_state.expenses.items() if v.balance_id != balance_id}