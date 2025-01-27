import pytest
from fastapi.testclient import TestClient
import sys
import os

# Append the app directory to the system path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app  # Import the FastAPI app
from app.state import BudgetState  # Import BudgetState for managing app state

client = TestClient(app)  # Create a TestClient instance for the app

@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown():
    # Setup the state before each test and teardown after
    app.state.budget_state = BudgetState()
    yield
    del app.state.budget_state

def test_root():
    # Test the root endpoint
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Budget App v1.0.0"}

def test_set_and_get_balance():
    # Test setting and getting a balance
    response = client.post("/balance/", json={"amount": 1000})
    assert response.status_code == 200
    assert response.json() == {"id": 1, "amount": 1000.0}

    response = client.get("/balance/1")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "amount": 1000.0}

def test_add_and_get_income():
    # Ensure the balance is initialized
    response = client.post("/balance/", json={"amount": 1000})
    assert response.status_code == 200

    # Test adding and getting an income
    response = client.post("/incomes/", json={"balance_id": 1, "source": "Job", "amount": 500})
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "source": "Job", "amount": 500.0}

    response = client.get("/incomes/1")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "source": "Job", "amount": 500.0}

def test_add_and_get_expense():
    # Ensure the balance is initialized
    response = client.post("/balance/", json={"amount": 1000})
    assert response.status_code == 200

    # Test adding and getting an expense
    response = client.post("/expenses/", json={"balance_id": 1, "category": "Food", "amount": 100})
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "category": "Food", "amount": 100.0}

    response = client.get("/expenses/1")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "category": "Food", "amount": 100.0}

def test_get_suggestions():
    # Ensure the balance is initialized
    response = client.post("/balance/", json={"amount": 1200})
    assert response.status_code == 200

    # Test getting suggestions
    response = client.get("/suggestions/1")
    assert response.status_code == 200

    suggestions = response.json()
    assert "Keep up the good work! Maintain a balanced budget." in suggestions
