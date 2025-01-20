from fastapi import APIRouter, HTTPException, Path, Request
from services.suggestion_service import fetch_financial_data, generate_suggestions
from llm_microservice.app.models.schemas import LLMResponse
import logging

# Configure logging for the router
logger = logging.getLogger(__name__)

router = APIRouter()

# Endpoint to fetch suggestions based on financial data for the given balance ID
@router.post("/{balance_id}", response_model=LLMResponse)
async def get_suggestions(
    request: Request,
    balance_id: int = Path(..., description="The ID of the balance"),
):
    # Fetch suggestions for the given balance ID
    try:
        # Step 1: Fetch financial data
        financial_data = fetch_financial_data(request, balance_id)
        logger.info(f"Financial data fetched for balance_id {balance_id}: {financial_data}")

        # Step 2: Generate suggestions using the LLM microservice
        llm_response_data = await generate_suggestions(financial_data)
        logger.info(f"Suggestions generated for balance_id {balance_id}")

        # Step 3: Validate and return the structured response using the LLMResponse schema
        structured_response = LLMResponse(**llm_response_data)
        return structured_response

    except ValueError as ve:
        # Handle validation errors
        logger.error(f"Validation error for balance_id {balance_id}: {str(ve)}")
        raise HTTPException(status_code=400, detail=f"Validation Error: {str(ve)}")
    except HTTPException as he:
        # Handle HTTP exceptions
        logger.error(f"HTTP error for balance_id {balance_id}: {he.detail}")
        raise he
    except Exception as e:
        # Handle unexpected errors
        logger.error(f"Unexpected error for balance_id {balance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected Error: {str(e)}")
