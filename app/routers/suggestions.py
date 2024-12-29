from fastapi import APIRouter, HTTPException, Request
from typing import List

router = APIRouter()

@router.get("/{balance_id}", response_model=List[str])
async def get_suggestions(request: Request, balance_id: int):
    # Get budget state
    budget_state = request.app.state.budget_state

    # Check if the balance ID exists
    if balance_id not in budget_state.balances:
        raise HTTPException(status_code=404, detail="Balance not found")
    
    # Calculate balance, total income, and total expense for the given balance ID
    balance = budget_state.balances[balance_id].amount
    total_income = sum(income.amount for income in budget_state.incomes.values() if income.balance_id == balance_id)
    total_expense = sum(expense.amount for expense in budget_state.expenses.values() if expense.balance_id == balance_id)
    
    suggestions = []  # Initialize suggestions list

    # Provide financial suggestions based on balance and income/expense comparison - ### this area will change ###
    if balance < 1000:
        suggestions.append("Consider building an emergency fund.")
    if total_income > total_expense:
        suggestions.append("You're doing great! How about investing in a retirement fund?")
    if total_expense > total_income:
        suggestions.append("You're spending more than you earn. Review your expenses for potential savings.")
    if balance > 5000:
        suggestions.append("You've got a healthy balance! Consider diversifying your investments.")
    
    # Default suggestion if no other suggestions are added
    if not suggestions:
        suggestions.append("Keep up the good work! Maintain a balanced budget.")

    return suggestions  # Return the list of suggestions
