from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

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

global balance, incomes, expenses
balance = Balance(amount=0.0)
incomes = []
expenses = []

@app.get("/")
async def get_root():
    return {"message": "Welcome to the Budget App"}

# Balance Routes
@app.post("/balance/", response_model=Balance)
async def set_balance(new_balance: Balance):
    global balance
    balance = new_balance
    return balance

@app.get("/balance/", response_model=Balance)
async def get_balance():
    return balance

# Income Routes
@app.post("/incomes/", response_model=Income)
async def add_income(income: Income):
    global balance
    incomes.append(income)
    balance.amount += income.amount
    return income

@app.get("/incomes/", response_model=List[Income])
async def get_incomes():
    return incomes

@app.delete("/incomes/")
async def delete_incomes():
    global incomes
    incomes = []
    return {"message": "All incomes deleted"}

# Expense Routes
@app.post("/expenses/", response_model=Expense)
async def add_expense(expense: Expense):
    global balance
    expenses.append(expense)
    balance.amount -= expense.amount
    return expense

@app.get("/expenses/", response_model=List[Expense])
async def get_expenses():
    return expenses

@app.delete("/expenses/")
async def delete_expenses():
    global expenses
    expenses = []
    return {"message": "All expenses deleted"}

# Suggestion Route
@app.get("/suggestions/")
async def get_suggestions():
    # Example logic - This will be updated.
    if balance.amount > 1000:
        return {"suggestion": "Consider investing in stocks or mutual funds"}
    elif balance.amount > 500:
        return {"suggestion": "Consider a high-yield savings account"}
    else:
        return {"suggestion": "Focus on building an emergency fund"}

