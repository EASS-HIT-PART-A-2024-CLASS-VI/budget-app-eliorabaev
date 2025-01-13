from fastapi import Request, HTTPException
from typing import List

async def generate_suggestions(request: Request, balance_id: int) -> List[str]:
    state = request.app.state.budget_state

    # Validate the balance ID
    if balance_id not in state.balances:
        raise HTTPException(status_code=404, detail="Balance not found")

    # Calculate financial metrics
    balance = state.balances[balance_id].amount
    total_income = sum(income.amount for income in state.incomes.values() if income.balance_id == balance_id)
    total_expense = sum(expense.amount for expense in state.expenses.values() if expense.balance_id == balance_id)

    # Generate suggestions
    suggestions = []
    if balance < 1000:
        suggestions.append("Consider building an emergency fund.")
    if total_income > total_expense:
        suggestions.append("You're doing great! How about investing in a retirement fund?")
    if total_expense > total_income:
        suggestions.append("You're spending more than you earn. Review your expenses for potential savings.")
    if balance > 5000:
        suggestions.append("You've got a healthy balance! Consider diversifying your investments.")

    # Default suggestion
    if not suggestions:
        suggestions.append("Keep up the good work! Maintain a balanced budget.")

    return suggestions
