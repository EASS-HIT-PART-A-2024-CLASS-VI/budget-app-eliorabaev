import requests
from fastapi import Request, HTTPException
from core.utils import get_balance_or_404, calculate_total_for_balance
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LLM_MICROSERVICE_URL = "http://llm_microservice:8001/suggestions/"

# Session dictionary to store suggestions for each balance_id
session_suggestions = {}

async def generate_suggestions(financial_data: dict):
    balance_id = financial_data["balance_id"]

    # Check if suggestions already exist for the session
    if balance_id in session_suggestions:
        logger.debug(f"Returning cached suggestions for balance_id: {balance_id}")
        return session_suggestions[balance_id]

    try:
        # Call the LLM microservice to fetch suggestions
        logger.debug(f"Sending data to LLM microservice: {financial_data}")
        response = requests.post(
            LLM_MICROSERVICE_URL,
            json={"user_data": financial_data}
        )
        response.raise_for_status()

        llm_response = response.json()
        logger.debug(f"LLM microservice response: {llm_response}")

        # Validate response format
        if "suggestions" in llm_response:
            suggestions = llm_response["suggestions"]
            session_suggestions[balance_id] = suggestions  # Cache suggestions in session
            return suggestions
        else:
            logger.error(f"Invalid response format: {llm_response}")
            raise HTTPException(status_code=500, detail="Invalid response format from LLM microservice")

    except requests.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM microservice error: {str(e)}")

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating suggestions: {str(e)}")


def fetch_financial_data(request: Request, balance_id: int) -> dict:
    """
    Constructs a dictionary containing the financial data for the given balance ID.
    """
    state = request.app.state.budget_state

    # Ensure the balance exists
    if balance_id not in state.balances:
        raise HTTPException(status_code=404, detail="Balance not found")

    balance = state.balances[balance_id].amount
    total_income = sum(
        income.amount for income in state.incomes.values() if income.balance_id == balance_id
    )
    total_expense = sum(
        expense.amount for expense in state.expenses.values() if expense.balance_id == balance_id
    )

    # Construct and return the financial data dictionary
    return {
        "balance_id": balance_id,
        "current_balance": balance,
        "total_income": total_income,
        "total_expense": total_expense,
    }
