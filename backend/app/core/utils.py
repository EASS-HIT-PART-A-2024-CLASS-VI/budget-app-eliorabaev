from fastapi import HTTPException

def get_balance_or_404(budget_state, balance_id):
    """
    Retrieves a balance by ID from the budget state.
    Raises a 404 error if the balance does not exist.
    """
    if balance_id not in budget_state.balances:
        raise HTTPException(status_code=404, detail="Balance not found")
    return budget_state.balances[balance_id]

def validate_positive_amount(amount: float):
    """
    Validates that the given amount is positive.
    Raises a ValueError if the amount is not valid.
    """
    if amount <= 0:
        raise ValueError("Amount must be a positive value")
    return amount

def calculate_total_for_balance(items, balance_id):
    """
    Calculates the total amount for a specific balance ID.
    Args:
        items: Dictionary of items (incomes/expenses).
        balance_id: The ID of the balance.
    Returns:
        float: The total amount for the given balance.
    """
    return sum(item.amount for item in items.values() if item.balance_id == balance_id)
