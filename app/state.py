from contextlib import asynccontextmanager
from fastapi import FastAPI
from models.balance import Balance, Income, Expense
from typing import Dict

class BudgetState:
    def __init__(self):
        self.current_balance_id = 1
        self.current_income_id = 1
        self.current_expense_id = 1
        self.balances: Dict[int, Balance] = {}
        self.incomes: Dict[int, Income] = {}
        self.expenses: Dict[int, Expense] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.budget_state = BudgetState()
    yield
    del app.state.budget_state
