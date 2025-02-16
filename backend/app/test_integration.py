import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.balance import Balance, Income, Expense
from typing import Dict
from httpx import AsyncClient
import asyncio

@pytest.fixture
def client():
    """Fixture for creating a test client"""
    return TestClient(app)

@pytest.fixture
def sample_balance() -> Dict:
    """Fixture for creating a sample balance"""
    return {"amount": 1000.0}

@pytest.fixture
def sample_income() -> Dict:
    """Fixture for creating a sample income"""
    return {
        "balance_id": 1,
        "source": "Salary",
        "amount": 5000.0
    }

@pytest.fixture
def sample_expense() -> Dict:
    """Fixture for creating a sample expense"""
    return {
        "balance_id": 1,
        "category": "Groceries",
        "amount": 200.0
    }

class TestBalanceEndpoints:
    def test_create_balance(self, client, sample_balance):
        """Test creating a new balance"""
        response = client.post("/balance/", json=sample_balance)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == sample_balance["amount"]
        assert "id" in data
        return data["id"]

    def test_get_balance(self, client, sample_balance):
        """Test retrieving a balance"""
        # First create a balance
        create_response = client.post("/balance/", json=sample_balance)
        balance_id = create_response.json()["id"]

        # Then retrieve it
        response = client.get(f"/balance/{balance_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == sample_balance["amount"]
        assert data["id"] == balance_id

    def test_update_balance(self, client, sample_balance):
        """Test updating a balance"""
        # Create a balance first
        create_response = client.post("/balance/", json=sample_balance)
        balance_id = create_response.json()["id"]

        # Update the balance
        updated_amount = {"amount": 1500.0}
        response = client.patch(f"/balance/{balance_id}", json=updated_amount)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == updated_amount["amount"]

    def test_delete_balance(self, client, sample_balance):
        """Test deleting a balance"""
        # Create a balance first
        create_response = client.post("/balance/", json=sample_balance)
        balance_id = create_response.json()["id"]

        # Delete the balance
        response = client.delete(f"/balance/{balance_id}")
        assert response.status_code == 204

        # Verify it's deleted
        get_response = client.get(f"/balance/{balance_id}")
        assert get_response.status_code == 404

    def test_nonexistent_balance(self, client):
        """Test handling of nonexistent balance ID"""
        response = client.get("/balance/9999")
        assert response.status_code == 404
        assert "Balance not found" in response.json()["detail"]

class TestIncomeEndpoints:
    def test_create_income(self, client, sample_balance, sample_income):
        """Test creating a new income"""
        # Create a balance first
        balance_response = client.post("/balance/", json=sample_balance)
        balance_id = balance_response.json()["id"]
        
        # Create income
        sample_income["balance_id"] = balance_id
        response = client.post("/incomes/", json=sample_income)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == sample_income["amount"]
        assert data["source"] == sample_income["source"]
        assert "id" in data

    def test_get_all_incomes(self, client, sample_balance, sample_income):
        """Test retrieving all incomes"""
        # Create a balance and income first
        balance_response = client.post("/balance/", json=sample_balance)
        sample_income["balance_id"] = balance_response.json()["id"]
        client.post("/incomes/", json=sample_income)

        # Get all incomes
        response = client.get("/incomes/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_update_income(self, client, sample_balance, sample_income):
        """Test updating an income"""
        # Create balance and income first
        balance_response = client.post("/balance/", json=sample_balance)
        sample_income["balance_id"] = balance_response.json()["id"]
        income_response = client.post("/incomes/", json=sample_income)
        income_id = income_response.json()["id"]

        # Update income
        updated_income = {"amount": 5500.0}
        response = client.patch(f"/incomes/{income_id}", json=updated_income)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == updated_income["amount"]

    def test_delete_income(self, client, sample_balance, sample_income):
        """Test deleting an income"""
        # Create balance and income first
        balance_response = client.post("/balance/", json=sample_balance)
        sample_income["balance_id"] = balance_response.json()["id"]
        income_response = client.post("/incomes/", json=sample_income)
        income_id = income_response.json()["id"]

        # Delete income
        response = client.delete(f"/incomes/{income_id}")
        assert response.status_code == 204

        # Verify deletion
        get_response = client.get(f"/incomes/{income_id}")
        assert get_response.status_code == 404

class TestExpenseEndpoints:
    def test_create_expense(self, client, sample_balance, sample_expense):
        """Test creating a new expense"""
        # Create a balance first
        balance_response = client.post("/balance/", json=sample_balance)
        balance_id = balance_response.json()["id"]
        
        # Create expense
        sample_expense["balance_id"] = balance_id
        response = client.post("/expenses/", json=sample_expense)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == sample_expense["amount"]
        assert data["category"] == sample_expense["category"]
        assert "id" in data

    def test_get_all_expenses(self, client, sample_balance, sample_expense):
        """Test retrieving all expenses"""
        # Create a balance and expense first
        balance_response = client.post("/balance/", json=sample_balance)
        sample_expense["balance_id"] = balance_response.json()["id"]
        client.post("/expenses/", json=sample_expense)

        # Get all expenses
        response = client.get("/expenses/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_update_expense(self, client, sample_balance, sample_expense):
        """Test updating an expense"""
        # Create balance and expense first
        balance_response = client.post("/balance/", json=sample_balance)
        sample_expense["balance_id"] = balance_response.json()["id"]
        expense_response = client.post("/expenses/", json=sample_expense)
        expense_id = expense_response.json()["id"]

        # Update expense
        updated_expense = {"amount": 250.0}
        response = client.patch(f"/expenses/{expense_id}", json=updated_expense)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == updated_expense["amount"]

    def test_delete_expense(self, client, sample_balance, sample_expense):
        """Test deleting an expense"""
        # Create balance and expense first
        balance_response = client.post("/balance/", json=sample_balance)
        sample_expense["balance_id"] = balance_response.json()["id"]
        expense_response = client.post("/expenses/", json=sample_expense)
        expense_id = expense_response.json()["id"]

        # Delete expense
        response = client.delete(f"/expenses/{expense_id}")
        assert response.status_code == 204

        # Verify deletion
        get_response = client.get(f"/expenses/{expense_id}")
        assert get_response.status_code == 404

class TestIntegrationFlows:
    def test_full_budget_flow(self, client, sample_balance, sample_income, sample_expense):
        """Test a complete budget management flow"""
        # 1. Create a balance
        balance_response = client.post("/balance/", json=sample_balance)
        assert balance_response.status_code == 200
        balance_id = balance_response.json()["id"]

        # 2. Add income
        sample_income["balance_id"] = balance_id
        income_response = client.post("/incomes/", json=sample_income)
        assert income_response.status_code == 200

        # 3. Add expense
        sample_expense["balance_id"] = balance_id
        expense_response = client.post("/expenses/", json=sample_expense)
        assert expense_response.status_code == 200

        # 4. Get suggestions
        suggestions_response = client.post(f"/suggestions/{balance_id}")
        assert suggestions_response.status_code == 200
        suggestions_data = suggestions_response.json()
        assert "analysis" in suggestions_data
        assert "suggestions" in suggestions_data

        # 5. Get balance graph data
        graph_response = client.get(f"/balance/{balance_id}/graph")
        assert graph_response.status_code == 200
        graph_data = graph_response.json()
        assert "balance_graph" in graph_data
        assert "projected_revenue" in graph_data

    def test_cascade_delete(self, client, sample_balance, sample_income, sample_expense):
        """Test that deleting a balance cascades to related incomes and expenses"""
        # Create initial data
        balance_response = client.post("/balance/", json=sample_balance)
        balance_id = balance_response.json()["id"]
        
        sample_income["balance_id"] = balance_id
        income_response = client.post("/incomes/", json=sample_income)
        income_id = income_response.json()["id"]
        
        sample_expense["balance_id"] = balance_id
        expense_response = client.post("/expenses/", json=sample_expense)
        expense_id = expense_response.json()["id"]

        # Delete the balance
        delete_response = client.delete(f"/balance/{balance_id}")
        assert delete_response.status_code == 204

        # Verify cascade deletion
        income_get = client.get(f"/incomes/{income_id}")
        assert income_get.status_code == 404
        
        expense_get = client.get(f"/expenses/{expense_id}")
        assert expense_get.status_code == 404

@pytest.mark.asyncio
async def test_async_operations():
    """Test async operations with multiple concurrent requests"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Create multiple balances concurrently
        balance_tasks = []
        for amount in [1000, 2000, 3000]:
            task = ac.post("/balance/", json={"amount": amount})
            balance_tasks.append(task)
        
        responses = await asyncio.gather(*balance_tasks)
        assert all(response.status_code == 200 for response in responses)

if __name__ == "__main__":
    pytest.main(["-v"])
