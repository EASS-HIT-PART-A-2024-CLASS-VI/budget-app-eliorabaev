from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from contextlib import asynccontextmanager

class Balance(BaseModel):
    amount: float

class Income(BaseModel):
    id: int
    source: str
    amount: float

class Expense(BaseModel):
    id: int
    category: str
    amount: float

class BudgetState:
    def __init__(self):
        self.balance = Balance(amount=0.0)
        self.incomes: List[Income] = []
        self.expenses: List[Expense] = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize shared state
    app.state.budget_state = BudgetState()
    yield
    # Clean up shared state if necessary
    del app.state.budget_state

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def get_root():
    return {"message": "Welcome to the Budget App"}

# Balance Routes
@app.post("/balance/", response_model=Balance)
async def set_balance(new_balance: Balance):
    app.state.budget_state.balance = new_balance
    return app.state.budget_state.balance

@app.get("/balance/", response_model=Balance)
async def get_balance():
    return app.state.budget_state.balance

# Income Routes
@app.post("/incomes/", response_model=Income)
async def add_income(income: Income):
    app.state.budget_state.incomes.append(income)
    app.state.budget_state.balance.amount += income.amount
    return income

@app.get("/incomes/", response_model=List[Income])
async def get_incomes():
    return app.state.budget_state.incomes

@app.delete("/incomes/")
async def delete_incomes():
    app.state.budget_state.incomes = []
    return {"message": "All incomes deleted"}

# Expense Routes
@app.post("/expenses/", response_model=Expense)
async def add_expense(expense: Expense):
    app.state.budget_state.expenses.append(expense)
    app.state.budget_state.balance.amount -= expense.amount
    return expense

@app.get("/expenses/", response_model=List[Expense])
async def get_expenses():
    return app.state.budget_state.expenses

@app.delete("/expenses/")
async def delete_expenses():
    app.state.budget_state.expenses = []
    return {"message": "All expenses deleted"}

# Suggestion Route
@app.get("/suggestions/")
async def get_suggestions():
    # Example logic - This will be updated.
    balance = app.state.budget_state.balance
    if balance.amount > 1000:
        return {"suggestion": "Consider investing in stocks or mutual funds"}
    elif balance.amount > 500:
        return {"suggestion": "Consider a high-yield savings account"}
    else:
        return {"suggestion": "Focus on building an emergency fund"}

