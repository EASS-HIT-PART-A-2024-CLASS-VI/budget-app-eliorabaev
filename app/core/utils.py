def calculate_balance(incomes, expenses):
    return sum(income.amount for income in incomes) - sum(expense.amount for expense in expenses)

def validate_amount(amount):
    if amount < 0:
        raise ValueError("Amount must be positive")
    return amount

def format_currency(amount):
    return f"${amount:,.2f}"
