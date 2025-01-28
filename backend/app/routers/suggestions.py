from fastapi import APIRouter, HTTPException, Path, Request
from services.suggestion_service import fetch_financial_data, generate_suggestions, session_suggestions
from llm_microservice.app.models.schemas import LLMResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Endpoint to fetch suggestions based on financial data for the given balance ID
@router.post("/{balance_id}", response_model=LLMResponse)
async def get_suggestions(
    request: Request,
    balance_id: int = Path(..., description="The ID of the balance"),
):
    try:
        # Fetch financial data for the given balance ID
        financial_data = fetch_financial_data(request, balance_id)
        logger.info(f"Financial data fetched for balance_id {balance_id}: {financial_data}")

        # Generate suggestions
        llm_response_data = await generate_suggestions(financial_data)
        logger.info(f"Suggestions generated for balance_id {balance_id}")

        # Return the structured response
        structured_response = LLMResponse(**llm_response_data)
        return structured_response

    except Exception as e:
        logger.error(f"Unexpected error for balance_id {balance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected Error: {str(e)}")


# Endpoint to retrieve cached suggestions for a balance ID
@router.get("/{balance_id}", response_model=LLMResponse)
async def get_cached_suggestions(balance_id: int):
    try:
        if balance_id not in session_suggestions:
            raise HTTPException(status_code=404, detail="Suggestions not found for this balance ID")
        
        # Retrieve suggestions from session storage
        suggestions = session_suggestions[balance_id]
        logger.info(f"Retrieved cached suggestions for balance_id {balance_id}")
        return suggestions

    except HTTPException as e:
        logger.error(f"Error retrieving suggestions: {e.detail}")
        raise e
