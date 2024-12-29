def calculate_balance(incomes, expenses):
    # Calculate the balance by subtracting the total expenses from the total incomes
    return sum(income.amount for income in incomes) - sum(expense.amount for expense in expenses)

def validate_amount(amount):
    # Validate that the amount is positive, raising an error if it is not
    if amount < 0:
        raise ValueError("Amount must be positive")
    return amount

def format_currency(amount):
    # Format the amount as a currency string with two decimal places
    return f"${amount:,.2f}"
