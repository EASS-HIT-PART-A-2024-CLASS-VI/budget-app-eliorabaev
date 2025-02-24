from pathlib import Path
import sys
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

# Adjust the import path:
# Current file is at: backend/app/tests/unit_test.py
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
    app.state.budget_state = BudgetState()
    yield
    del app.state.budget_state

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Budget App v1.0.0"}

def test_set_and_get_balance():
    response = client.post("/balance/", json={"amount": 1000})
    assert response.status_code == 200
    assert response.json() == {"id": 1, "amount": 1000.0}

    response = client.get("/balance/1")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "amount": 1000.0}

def test_set_balance_negative_amount():
    response = client.post("/balance/", json={"amount": -500})
    assert response.status_code == 422

def test_add_and_get_income():
    client.post("/balance/", json={"amount": 1000})  # Ensure the balance is initialized

    response = client.post("/incomes/", json={"balance_id": 1, "source": "Job", "amount": 500})
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "source": "Job", "amount": 500.0}

    response = client.get("/incomes/1")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "source": "Job", "amount": 500.0}

def test_add_income_invalid_balance():
    response = client.post("/incomes/", json={"balance_id": 999, "source": "Job", "amount": 500})
    assert response.status_code == 404

def test_add_and_get_expense():
    client.post("/balance/", json={"amount": 1000})  # Ensure the balance is initialized

    response = client.post("/expenses/", json={"balance_id": 1, "category": "Food", "amount": 100})
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "category": "Food", "amount": 100.0}

    response = client.get("/expenses/1")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "balance_id": 1, "category": "Food", "amount": 100.0}

def test_add_expense_invalid_balance():
    response = client.post("/expenses/", json={"balance_id": 999, "category": "Food", "amount": 100})
    assert response.status_code == 404

def test_get_all_incomes():
    client.post("/balance/", json={"amount": 1000})
    client.post("/incomes/", json={"balance_id": 1, "source": "Job", "amount": 500})
    client.post("/incomes/", json={"balance_id": 1, "source": "Freelance", "amount": 300})

    response = client.get("/incomes/")
    assert response.status_code == 200
    incomes = response.json()
    assert len(incomes) == 2

def test_get_suggestions():
    client.post("/balance/", json={"amount": 1200})

    with patch("services.suggestion_service.requests.post") as mock_post:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            "balance_id": 1,
            "current_balance": 1200,
            "total_income": 5000,
            "total_expense": 3800,
            "analysis": {
                "cash_flow_status": "Positive",
                "summary": "Your cash flow is in a healthy state.",
                "warnings": ["High spending on entertainment."],
                "positives": ["Consistent savings each month."]
            },
            "swot": {
                "strengths": ["High income stability"],
                "weaknesses": ["Over-reliance on a single income source"],
                "opportunities": ["Invest in diversified assets"],
                "threats": ["Economic downturn"]
            },
            "suggestions": [
                {
                    "category": "Savings",
                    "details": "Increase your savings rate by 10% to build an emergency fund.",
                    "priority": 1,
                    "impact": "High",
                    "level_of_effort": "Low",
                    "actionable": True,
                    "steps": ["Review monthly budget", "Set up an automated savings plan"],
                    "reference_url": "https://example.com/saving-tips"
                },
                {
                    "category": "Investing",
                    "details": "Start investing in index funds to grow your wealth.",
                    "priority": 2,
                    "impact": "High",
                    "level_of_effort": "Medium",
                    "actionable": True,
                    "steps": ["Research index funds", "Open an investment account"],
                    "reference_url": "https://example.com/investing-guide"
                }
            ],
            "generated_at": "2025-01-27T12:34:56Z"
        }

        response = client.post("/suggestions/1")
        assert response.status_code == 200
        suggestions = response.json()
        
        # Assertions for the response
        assert "balance_id" in suggestions
        assert suggestions["balance_id"] == 1
        assert "analysis" in suggestions
        assert suggestions["analysis"]["cash_flow_status"] == "Positive"
        assert "suggestions" in suggestions
        assert len(suggestions["suggestions"]) == 2
