from pathlib import Path
import sys
import pytest
import httpx
import respx
from fastapi.testclient import TestClient
from datetime import datetime

# Adjust the import path:
# Current file is at: backend/app/graph_microservice/app/tests/test_graph_routes.py
# We go three levels up to get: backend/app/graph_microservice
current_file = Path(__file__).resolve()
app_dir = current_file.parent.parent.parent
sys.path.insert(0, str(app_dir))

# Import the FastAPI app (assumes you have defined it in app/main.py)
from app.main import app

# Create a TestClient instance for our FastAPI app
client = TestClient(app)

# Define test data that will be returned from the mocked backend endpoints
balance_id = 1
balance_data = {"amount": 1000.0}
incomes_data = [{"amount": 200.0}, {"amount": 300.0}]
expenses_data = [{"amount": 100.0}]
backend_url = "http://backend:8000"

@respx.mock
def test_get_balance_graph_default_year():
    """
    Test the /balance-graph/{balance_id} endpoint without a query parameter.
    By default, the target year is set to current_year + 15.
    """
    # Mock the backend HTTP calls
    respx.get(f"{backend_url}/balance/{balance_id}").mock(
        return_value=httpx.Response(200, json=balance_data)
    )
    respx.get(f"{backend_url}/incomes/").mock(
        return_value=httpx.Response(200, json=incomes_data)
    )
    respx.get(f"{backend_url}/expenses/").mock(
        return_value=httpx.Response(200, json=expenses_data)
    )

    response = client.get(f"/balance-graph/{balance_id}")
    assert response.status_code == 200

    result = response.json()
    current_year = datetime.now().year
    # By default, target_year = current_year + 15 so we expect 16 entries.
    expected_years = list(range(current_year, current_year + 16))

    # Calculate the expected balance.
    # The endpoint computes monthly net = (200+300 - 100) = 400,
    # and for 12 months that is 400 * 12 = 4800 per year.
    expected_balance = balance_data["amount"]
    expected_results = []
    for year in expected_years:
        expected_balance += 4800
        expected_results.append({"year": year, "balance": expected_balance})

    # Check that the response contains the expected number of items
    assert len(result) == len(expected_results)
    # Check a few entries (first and last) for correctness
    assert result[0]["year"] == expected_results[0]["year"]
    assert result[0]["balance"] == expected_results[0]["balance"]
    assert result[-1]["year"] == expected_results[-1]["year"]
    assert result[-1]["balance"] == expected_results[-1]["balance"]

@respx.mock
def test_get_balance_graph_with_query_year():
    """
    Test the /balance-graph/{balance_id} endpoint when a target year is provided.
    """
    respx.get(f"{backend_url}/balance/{balance_id}").mock(
        return_value=httpx.Response(200, json=balance_data)
    )
    respx.get(f"{backend_url}/incomes/").mock(
        return_value=httpx.Response(200, json=incomes_data)
    )
    respx.get(f"{backend_url}/expenses/").mock(
        return_value=httpx.Response(200, json=expenses_data)
    )

    target_year = 2030
    response = client.get(f"/balance-graph/{balance_id}?year={target_year}")
    assert response.status_code == 200

    result = response.json()
    current_year = datetime.now().year
    expected_years = list(range(current_year, target_year + 1))

    expected_balance = balance_data["amount"]
    expected_results = []
    for year in expected_years:
        expected_balance += 4800
        expected_results.append({"year": year, "balance": expected_balance})

    assert len(result) == len(expected_results)
    for res, exp in zip(result, expected_results):
        assert res["year"] == exp["year"]
        assert res["balance"] == exp["balance"]

@respx.mock
def test_get_projected_revenue_default_year():
    """
    Test the /projected-revenue/{balance_id} endpoint without a query parameter.
    The endpoint calculates the new balance using yearly compounding at 8%.
    """
    respx.get(f"{backend_url}/balance/{balance_id}").mock(
        return_value=httpx.Response(200, json=balance_data)
    )
    respx.get(f"{backend_url}/incomes/").mock(
        return_value=httpx.Response(200, json=incomes_data)
    )
    respx.get(f"{backend_url}/expenses/").mock(
        return_value=httpx.Response(200, json=expenses_data)
    )

    response = client.get(f"/projected-revenue/{balance_id}")
    assert response.status_code == 200

    result = response.json()
    current_year = datetime.now().year
    expected_years = list(range(current_year, current_year + 16))

    # For each year, the endpoint adds the annual contribution (4800) then applies an 8% growth.
    expected_balance = balance_data["amount"]
    expected_results = []
    for year in expected_years:
        expected_balance = (expected_balance + 4800) * 1.08
        expected_results.append({"year": year, "projected_balance": expected_balance})

    assert len(result) == len(expected_results)
    for res, exp in zip(result, expected_results):
        assert res["year"] == exp["year"]
        # Use pytest.approx for floating point comparisons.
        assert pytest.approx(res["projected_balance"], rel=1e-5) == exp["projected_balance"]

@respx.mock
def test_get_projected_revenue_with_query_year():
    """
    Test the /projected-revenue/{balance_id} endpoint with a provided target year.
    """
    respx.get(f"{backend_url}/balance/{balance_id}").mock(
        return_value=httpx.Response(200, json=balance_data)
    )
    respx.get(f"{backend_url}/incomes/").mock(
        return_value=httpx.Response(200, json=incomes_data)
    )
    respx.get(f"{backend_url}/expenses/").mock(
        return_value=httpx.Response(200, json=expenses_data)
    )

    target_year = 2030
    response = client.get(f"/projected-revenue/{balance_id}?year={target_year}")
    assert response.status_code == 200

    result = response.json()
    current_year = datetime.now().year
    expected_years = list(range(current_year, target_year + 1))

    expected_balance = balance_data["amount"]
    expected_results = []
    for year in expected_years:
        expected_balance = (expected_balance + 4800) * 1.08
        expected_results.append({"year": year, "projected_balance": expected_balance})

    assert len(result) == len(expected_results)
    for res, exp in zip(result, expected_results):
        assert res["year"] == exp["year"]
        assert pytest.approx(res["projected_balance"], rel=1e-5) == exp["projected_balance"]
