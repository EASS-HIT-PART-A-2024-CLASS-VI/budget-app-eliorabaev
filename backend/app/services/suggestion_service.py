import requests
from fastapi import Request, HTTPException
from core.utils import get_balance_or_404, calculate_total_for_balance
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# URL for the LLM microservice
LLM_MICROSERVICE_URL = "http://llm_microservice:8001/suggestions/"

# Session dictionary to store suggestions for each balance_id
session_suggestions = {}

# Sends user financial data to the LLM microservice and retrieves structured suggestions
async def generate_suggestions(financial_data: dict):
    # Required keys for financial data
    required_keys = ["balance_id", "current_balance", "total_income", "total_expense"]

    # Validate financial_data
    missing_keys = [key for key in required_keys if key not in financial_data]
    if missing_keys:
        logger.error(f"Missing keys in financial_data: {missing_keys}")
        raise HTTPException(status_code=400, detail=f"Missing keys in financial_data: {missing_keys}")

    logger.info(f"Sending financial data to LLM microservice: {financial_data}")

    try:
        # Make a POST request to the LLM microservice
        response = requests.post(
            LLM_MICROSERVICE_URL,
            json=financial_data
        )
        response.raise_for_status()

        # Parse the JSON response
        llm_response = response.json()
        logger.info(f"Received response from LLM microservice")

        return llm_response

    except requests.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM microservice error: {str(e)}")

# Constructs a dictionary containing the financial data for the given balance ID
def fetch_financial_data(request: Request, balance_id: int) -> dict:
    # Get the budget state from the application
    state = request.app.state.budget_state

    # Ensure the balance exists
    balance = state.balances.get(balance_id)
    if not balance:
        raise HTTPException(status_code=404, detail="Balance not found")

    # Calculate total income and expense
    total_income = sum(
        income.amount for income in state.incomes.values() if income.balance_id == balance_id
    )
    total_expense = sum(
        expense.amount for expense in state.expenses.values() if expense.balance_id == balance_id
    )

    # Construct and return the financial data dictionary
    financial_data = {
        "balance_id": balance_id,
        "current_balance": balance.amount,
        "total_income": total_income,
        "total_expense": total_expense,
    }

    logger.info(f"Fetched financial data for balance_id {balance_id}: {financial_data}")
    return financial_data
