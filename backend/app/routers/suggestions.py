from fastapi import APIRouter, HTTPException, Request, Path
from services.suggestion_service import fetch_financial_data, generate_suggestions


router = APIRouter()

@router.post("/{balance_id}")
async def get_suggestions(request: Request, balance_id: int = Path(..., description="The ID of the balance")):
    """
    Fetch suggestions based on financial data for the given balance_id.
    """
    try:
        # Fetch financial data
        financial_data = fetch_financial_data(request, balance_id)

        # Ensure balance_id is included in financial_data
        financial_data["balance_id"] = balance_id

        # Generate suggestions using the service
        suggestions = await generate_suggestions(financial_data)

        return {"suggestions": suggestions}

    except HTTPException as e:
        # Re-raise HTTP exceptions for FastAPI to handle
        raise e
    except Exception as e:
        # Handle unexpected exceptions
        raise HTTPException(status_code=500, detail=str(e))