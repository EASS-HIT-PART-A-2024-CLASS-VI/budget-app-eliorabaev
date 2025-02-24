from pathlib import Path
import sys
import json
import pytest
import asyncio
from fastapi.testclient import TestClient
from dotenv import load_dotenv
import os

# Adjust the import path:
# Current file is at: backend/app/llm_microservice/app/tests/test_llm_microservice.py
# We go three levels up to get: backend/app/llm_microservice
current_file = Path(__file__).resolve()
llm_microservice_dir = current_file.parents[2]  # Go up two levels to reach `llm_microservice`
sys.path.insert(0, str(llm_microservice_dir))  # Add `llm_microservice` to Python path

# Load the .env file explicitly from `llm_microservice`
dotenv_path = llm_microservice_dir / ".env"
load_dotenv(dotenv_path)

# Debugging: Check if GEMINI_API_KEY is loaded
if not os.getenv("GEMINI_API_KEY"):
    raise EnvironmentError("GEMINI_API_KEY is not set in the .env file.")

# Now import the application modules using absolute imports.
from app.main import app  # Import using the full path
from app.services.llm_service import get_suggestions, load_prompt_template

client = TestClient(app)

# Dummy response object to simulate Gemini AI's output
class DummyResponse:
    def __init__(self, text):
        self.text = text

# A valid JSON string conforming to the LLMResponse schema
VALID_JSON = json.dumps({
    "balance_id": 1,
    "current_balance": 1000.0,
    "total_income": 2000.0,
    "total_expense": 1500.0,
    "analysis": {
        "cash_flow_status": "Positive",
        "summary": "Your cash flow is healthy.",
        "warnings": [],
        "positives": ["Good income", "Manageable expenses"]
    },
    "swot": {
        "strengths": ["Steady income"],
        "weaknesses": ["High expenses"],
        "opportunities": ["Budget optimization"],
        "threats": ["Unexpected expenses"]
    },
    "suggestions": []
})

# --- Test 1: Validate missing keys error ---
@pytest.mark.asyncio
async def test_get_suggestions_missing_keys():
    # Data is missing the "total_expense" key.
    data = {
        "balance_id": 1,
        "current_balance": 1000.0,
        "total_income": 2000.0
    }
    with pytest.raises(ValueError, match="Missing required keys"):
        await get_suggestions(data)

# --- Test 2: Valid get_suggestions processing with dummy Gemini AI response ---
@pytest.mark.asyncio
async def test_get_suggestions_valid(monkeypatch):
    # Override load_prompt_template to return a simple dummy prompt.
    dummy_prompt = "Balance: ${current_balance}, Income: ${total_income}, Expense: ${total_expense}, ID: ${balance_id}"
    monkeypatch.setattr("app.services.llm_service.load_prompt_template", lambda filepath: dummy_prompt)

    # Create a dummy model that always returns a DummyResponse with VALID_JSON.
    class DummyModel:
        def __init__(self, model_name):
            self.model_name = model_name
        def generate_content(self, prompt, generation_config):
            return DummyResponse(VALID_JSON)
    
    monkeypatch.setattr("app.services.llm_service.genai.GenerativeModel", DummyModel)

    data = {
        "balance_id": 1,
        "current_balance": 1000.0,
        "total_income": 2000.0,
        "total_expense": 1500.0
    }
    response = await get_suggestions(data)
    
    # Check that the response has the correct keys and values.
    assert response["balance_id"] == 1
    assert response["current_balance"] == 1000.0
    assert "generated_at" in response
    assert response["analysis"]["cash_flow_status"] == "Positive"

# --- Test 3: FastAPI endpoint testing ---
def test_get_llm_suggestions_endpoint(monkeypatch):
    # Override the prompt loader and the Gemini AI call as in the previous test.
    dummy_prompt = "Balance: ${current_balance}, Income: ${total_income}, Expense: ${total_expense}, ID: ${balance_id}"
    monkeypatch.setattr("app.services.llm_service.load_prompt_template", lambda filepath: dummy_prompt)
    
    class DummyModel:
        def __init__(self, model_name):
            self.model_name = model_name
        def generate_content(self, prompt, generation_config):
            # Use a slightly different valid JSON to differentiate from the previous test.
            valid_json_endpoint = json.dumps({
                "balance_id": 2,
                "current_balance": 2000.0,
                "total_income": 3000.0,
                "total_expense": 2500.0,
                "analysis": {
                    "cash_flow_status": "Neutral",
                    "summary": "Cash flow is balanced.",
                    "warnings": ["Monitor expenses"],
                    "positives": ["Good saving habits"]
                },
                "swot": {
                    "strengths": ["Diverse income sources"],
                    "weaknesses": ["Limited investments"],
                    "opportunities": ["Expand portfolio"],
                    "threats": ["Market volatility"]
                },
                "suggestions": []
            })
            return DummyResponse(valid_json_endpoint)
    
    monkeypatch.setattr("app.services.llm_service.genai.GenerativeModel", DummyModel)
    
    client = TestClient(app)
    payload = {
        "balance_id": 2,
        "current_balance": 2000.0,
        "total_income": 3000.0,
        "total_expense": 2500.0
    }
    response = client.post("/suggestions/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["balance_id"] == 2
    assert data["analysis"]["cash_flow_status"] == "Neutral"

# --- Test 4: load_prompt_template should raise error if file is not found ---
def test_load_prompt_template_file_not_found(tmp_path):
    # Create a file path that does not exist.
    non_existent_file = tmp_path / "non_existent.txt"
    with pytest.raises(FileNotFoundError):
        load_prompt_template(str(non_existent_file))
