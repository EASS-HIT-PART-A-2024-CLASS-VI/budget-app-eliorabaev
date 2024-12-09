import pytest
from fastapi.testclient import TestClient
from app.main import app, incomes, expenses, balance  # Import global variables from main

client = TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown():
    incomes.clear()
    expenses.clear()
    balance.amount = 0.0
    yield
    incomes.clear()
    expenses.clear()
    balance.amount = 0.0

def test_get_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Budget App"}

def test_set_and_get_balance():
    response = client.post("/balance/", json={"amount": 1000})
    assert response.status_code == 200
    assert response.json() == {"amount": 1000.0}

    response = client.get("/balance/")
    assert response.status_code == 200
    assert response.json() == {"amount": 1000.0}

def test_add_and_get_income():
    response = client.post("/incomes/", json={"id": 1, "source": "Job", "amount": 500})
    assert response.status_code == 200
    assert response.json() == {"id": 1, "source": "Job", "amount": 500.0}

    response = client.get("/incomes/")
    assert response.status_code == 200
    assert response.json() == [{"id": 1, "source": "Job", "amount": 500.0}]

def test_add_and_get_expense():
    response = client.post("/expenses/", json={"id": 1, "category": "Food", "amount": 100})
    assert response.status_code == 200
    assert response.json() == {"id": 1, "category": "Food", "amount": 100.0}

    response = client.get("/expenses/")
    assert response.status_code == 200
    assert response.json() == [{"id": 1, "category": "Food", "amount": 100.0}]

def test_get_suggestions():
    response = client.post("/balance/", json={"amount": 1200})
    assert response.status_code == 200

    response = client.get("/suggestions/")
    assert response.status_code == 200
    assert response.json() == {"suggestion": "Consider investing in stocks or mutual funds"}

