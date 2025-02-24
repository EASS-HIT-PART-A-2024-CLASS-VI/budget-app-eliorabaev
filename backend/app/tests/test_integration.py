from pathlib import Path
import sys
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

# Adjust the import path:
# Current file is at: backend/app/tests/test_integration.py
# We go two levels up to get: backend/app
current_file = Path(__file__).resolve()
app_dir = current_file.parent.parent
sys.path.insert(0, str(app_dir))

# Now import the application modules.
from main import app  # Import directly from the current directory
from state import BudgetState

client = TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown():
    """
    Setup the state before each test and teardown after.
    """
    app.state.budget_state = BudgetState()
    yield
    del app.state.budget_state

# Test bulk creation of incomes and expenses
def test_bulk_income_expense_creation():
    client.post("/balance/", json={"amount": 2000})

    # Add multiple incomes
    incomes = [
        {"balance_id": 1, "source": "Salary", "amount": 5000},
        {"balance_id": 1, "source": "Freelance", "amount": 1200},
    ]
    for income in incomes:
        response = client.post("/incomes/", json=income)
        assert response.status_code == 200
    
    # Add multiple expenses
    expenses = [
        {"balance_id": 1, "category": "Rent", "amount": 1500},
        {"balance_id": 1, "category": "Groceries", "amount": 300},
    ]
    for expense in expenses:
        response = client.post("/expenses/", json=expense)
        assert response.status_code == 200
    
    # Check total incomes and expenses
    response = client.get("/incomes/")
    assert response.status_code == 200
    assert len(response.json()) == 2
    
    response = client.get("/expenses/")
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_invalid_suggestions_request():
    """Ensure suggestions API handles non-existing balances gracefully."""
    response = client.post("/suggestions/999")
    assert response.status_code == 404
    assert "Balance not found" in response.json()["detail"]

def test_cannot_assign_transaction_to_invalid_balance():
    """Ensure transactions cannot be assigned to invalid balance IDs."""
    response = client.post("/incomes/", json={"balance_id": 999, "source": "Bonus", "amount": 100})
    assert response.status_code == 404
    
    response = client.post("/expenses/", json={"balance_id": 999, "category": "Entertainment", "amount": 50})
    assert response.status_code == 404

if __name__ == "__main__":
    pytest.main(["-v"])
