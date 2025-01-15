import requests
from fastapi import Request, HTTPException
from core.utils import get_balance_or_404, calculate_total_for_balance
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LLM_MICROSERVICE_URL = "http://llm_microservice:8001/suggestions/"

import logging
import requests
from fastapi import HTTPException

logger = logging.getLogger(__name__)

LLM_MICROSERVICE_URL = "http://llm_microservice:8001/suggestions/"

async def generate_suggestions(financial_data: dict):
    """
    Sends user financial data to the LLM microservice and fetches suggestions.
    """
    try:
        # Send POST request to the LLM microservice
        logger.debug(f"Sending data to LLM microservice: {financial_data}")
        response = requests.post(
            LLM_MICROSERVICE_URL,
            json={"user_data": financial_data}
        )
        response.raise_for_status()

        # Parse response
        raw_response = response.text.strip()
        logger.debug(f"Raw LLM microservice response: {raw_response}")

        # Handle trailing characters like "%"
        if raw_response.endswith("%"):
            raw_response = raw_response[:-1]
            logger.warning("Stripped trailing '%' from the LLM response")

        # Attempt to parse JSON
        try:
            llm_response = response.json()
        except ValueError:
            logger.error(f"Failed to parse JSON from LLM response: {raw_response}")
            raise HTTPException(status_code=500, detail="LLM response is not valid JSON")

        # Validate and return suggestions
        if "suggestions" in llm_response:
            return llm_response["suggestions"]
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
