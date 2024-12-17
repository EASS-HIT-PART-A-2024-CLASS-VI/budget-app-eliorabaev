from fastapi import APIRouter, HTTPException
from typing import List
from shared_data import balances, incomes, expenses

router = APIRouter()

@router.get("/{balance_id}", response_model=List[str])
async def get_suggestions(balance_id: int):
    if balance_id not in balances:
        raise HTTPException(status_code=404, detail="Balance not found")
    
    balance = balances[balance_id].amount
    total_income = sum(income.amount for income in incomes.values() if income.balance_id == balance_id)
    total_expense = sum(expense.amount for expense in expenses.values() if expense.balance_id == balance_id)
    
    suggestions = []

    if balance < 1000:
        suggestions.append("Consider building an emergency fund.")
    if total_income > total_expense:
        suggestions.append("You're doing great! How about investing in a retirement fund?")
    if total_expense > total_income:
        suggestions.append("You're spending more than you earn. Review your expenses for potential savings.")
    if balance > 5000:
        suggestions.append("You've got a healthy balance! Consider diversifying your investments.")
    
    if not suggestions:
        suggestions.append("Keep up the good work! Maintain a balanced budget.")

    return suggestions
