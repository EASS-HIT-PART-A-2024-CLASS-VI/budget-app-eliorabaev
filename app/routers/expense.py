from fastapi import APIRouter, HTTPException
from models.balance import Expense
from typing import List
from shared_data import balances, expenses

router = APIRouter()
current_expense_id = 1

@router.post("/", response_model=Expense)
async def add_expense(expense: Expense):
    global current_expense_id
    if expense.balance_id not in balances:
        raise HTTPException(status_code=404, detail="Associated balance not found")
    
    expense.id = current_expense_id
    expenses[current_expense_id] = expense
    current_expense_id += 1
    return expense

@router.get("/{expense_id}", response_model=Expense)
async def get_expense(expense_id: int):
    if expense_id not in expenses:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expenses[expense_id]

@router.get("/", response_model=List[Expense])
async def get_expenses():
    return list(expenses.values())
