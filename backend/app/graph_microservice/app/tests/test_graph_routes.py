import pytest
from datetime import datetime
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch
from app.graph_microservice.app.main import app

# Data used for mocking the external HTTP responses.
data_mock = {
    "balance": {"amount": 1000},
    "incomes": [{"amount": 500}],
    "expenses": [{"amount": 200}],
}

@pytest.mark.asyncio
async def test_get_balance_graph():
    # Create a list that holds the sequential responses for the external calls.
    # The first call (balance), second (incomes), and third (expenses)
    json_responses = [data_mock["balance"], data_mock["incomes"], data_mock["expenses"]]

    # A simple class that mimics the parts of an httpx.Response we use.
    class MockResponse:
        status_code = 200

        def json(self):
            # Each call returns the next value from our list.
            return json_responses.pop(0)

        def raise_for_status(self):
            # Simulate a successful response (do nothing).
            pass

    # Create an instance of the mock response.
    mock_response = MockResponse()

    # Import the httpx module as used in your route module.
    from app.graph_microservice.app.routes.graph_routes import httpx
    # Save the original get method.
    original_get = httpx.AsyncClient.get

    # Define an async side-effect function.
    async def get_side_effect(self, url, *args, **kwargs):
        # Only intercept calls to the external backend.
        if url.startswith("http://backend:8000"):
            return mock_response
        # Otherwise, use the original get.
        return await original_get(self, url, *args, **kwargs)

    # Patch the get method *in the route module*.
    with patch("app.graph_microservice.app.routes.graph_routes.httpx.AsyncClient.get", new=get_side_effect):
        # Create an ASGI transport for your app.
        transport = ASGITransport(app=app)
        # Note: do NOT pass app=app into AsyncClient—use the transport.
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/balance-graph/1")
            assert response.status_code == 200

            # Get the JSON response from your endpoint.
            result = response.json()
            # The route should return a list of computed balance graph data.
            assert isinstance(result, list)

            # Check that the first item contains a valid 'year' and 'balance'.
            current_year = datetime.now().year
            assert result[0]["year"] >= current_year
            assert "balance" in result[0]

@pytest.mark.asyncio
async def test_get_projected_revenue():
    # Prepare the responses for the three external calls.
    json_responses = [data_mock["balance"], data_mock["incomes"], data_mock["expenses"]]

    class MockResponse:
        status_code = 200

        def json(self):
            return json_responses.pop(0)

        def raise_for_status(self):
            pass

    mock_response = MockResponse()

    from app.graph_microservice.app.routes.graph_routes import httpx
    original_get = httpx.AsyncClient.get

    async def get_side_effect(self, url, *args, **kwargs):
        if url.startswith("http://backend:8000"):
            return mock_response
        return await original_get(self, url, *args, **kwargs)

    with patch("app.graph_microservice.app.routes.graph_routes.httpx.AsyncClient.get", new=get_side_effect):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/projected-revenue/1")
            assert response.status_code == 200

            result = response.json()
            assert isinstance(result, list)

            current_year = datetime.now().year
            assert result[0]["year"] >= current_year
            assert "projected_balance" in result[0]
