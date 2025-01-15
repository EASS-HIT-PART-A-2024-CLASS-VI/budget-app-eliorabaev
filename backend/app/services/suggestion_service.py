import requests
from fastapi import Request, HTTPException
from core.utils import get_balance_or_404, calculate_total_for_balance

# URL for the LLM microservice
LLM_MICROSERVICE_URL = "http://llm_microservice:8001/suggestions/"

async def generate_suggestions(request: Request, balance_id: int):
    state = request.app.state.budget_state
    balance = get_balance_or_404(state, balance_id)

    # Calculate total income and expense for the balance
    total_income = calculate_total_for_balance(state.incomes, balance_id)
    total_expense = calculate_total_for_balance(state.expenses, balance_id)

    # Prepare user data for the LLM microservice
    user_data = {
        "balance_id": balance_id,
        "current_balance": balance.amount,
        "total_income": total_income,
        "total_expense": total_expense,
    }

    try:
        # Call the LLM microservice
        response = requests.post(
            LLM_MICROSERVICE_URL,
            json={"user_data": user_data}
        )
        response.raise_for_status()
        llm_response = response.json()

        # Return the suggestions from the LLM microservice
        if "suggestions" in llm_response:
            return llm_response["suggestions"]
        else:
            raise HTTPException(status_code=500, detail="Invalid response from LLM microservice")

    except requests.RequestException as e:
        # Handle errors from the microservice call
        raise HTTPException(status_code=500, detail=f"LLM microservice error: {str(e)}")
