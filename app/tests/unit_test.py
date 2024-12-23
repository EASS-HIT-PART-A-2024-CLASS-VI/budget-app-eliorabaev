import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Budget App"}

def test_set_and_get_balance():
    response = client.post("/balance/", json={"amount": 1000})
    assert response.status_code == 200
    assert response.json() == {"id": 1, "amount": 1000.0}

    response = client.get("/balance/1")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "amount": 1000.0}

def test_add_and_get_income():
    response = client.post("/incomes/", json={"balance_id": 1, "source": "Job", "amount": 500})
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "source": "Job", "amount": 500.0}

    response = client.get("/incomes/1")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "source": "Job", "amount": 500.0}

def test_add_and_get_expense():
    response = client.post("/expenses/", json={"balance_id": 1, "category": "Food", "amount": 100})
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "category": "Food", "amount": 100.0}

    response = client.get("/expenses/1")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "category": "Food", "amount": 100.0}

def test_get_suggestions():
    response = client.post("/balance/", json={"amount": 1200})
    assert response.status_code == 200

    response = client.get("/suggestions/1")
    assert response.status_code == 200
    assert "suggestion" in response.json()
