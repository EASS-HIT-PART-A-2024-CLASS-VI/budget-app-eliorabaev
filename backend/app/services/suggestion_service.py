from fastapi import Request
from core.utils import get_balance_or_404, calculate_total_for_balance

async def generate_suggestions(request: Request, balance_id: int):
    state = request.app.state.budget_state
    balance = get_balance_or_404(state, balance_id)

    # Use the utility for total calculations
    total_income = calculate_total_for_balance(state.incomes, balance_id)
    total_expense = calculate_total_for_balance(state.expenses, balance_id)

    suggestions = []
    if balance.amount < 1000:
        suggestions.append("Consider building an emergency fund.")
    if total_income > total_expense:
        suggestions.append("You're doing great! How about investing in a retirement fund?")
    if total_expense > total_income:
        suggestions.append("You're spending more than you earn. Review your expenses for potential savings.")
    if balance.amount > 5000:
        suggestions.append("You've got a healthy balance! Consider diversifying your investments.")

    if not suggestions:
        suggestions.append("Keep up the good work! Maintain a balanced budget.")

    return suggestions
