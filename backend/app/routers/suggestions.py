from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
import requests
import logging

import crud
from db.database import get_db
from db.models import Balance, Income, Expense, SuggestionCache, User
from core.auth_dependencies import get_current_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# URL for the LLM microservice
LLM_MICROSERVICE_URL = "http://llm_microservice:8001/suggestions/"

router = APIRouter()

# Endpoint to fetch suggestions based on financial data for the given balance ID
@router.post("/{balance_id}")
async def get_suggestions(
    balance_id: int = Path(..., description="The ID of the balance"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """
    Generate financial suggestions for a balance (user must be authenticated)
    """
    db_balance = crud.balance.get_balance(db, balance_id)
    if not db_balance:
        raise HTTPException(status_code=404, detail="Balance not found")
    
    if db_balance.user_id and db_balance.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this balance")
    
    try:
        # Fetch financial data for the given balance ID
        financial_data = fetch_financial_data(db, balance_id)
        logger.info(f"Financial data fetched for balance_id {balance_id} by user {current_user.username}: {financial_data}")

        # Generate suggestions
        llm_response_data = await generate_suggestions(financial_data)
        logger.info(f"Suggestions generated for balance_id {balance_id} by user {current_user.username}")

        # Cache the suggestions
        crud.suggestion.create_or_update_suggestion_cache(db, balance_id, llm_response_data)

        # Return the structured response
        return llm_response_data

    except Exception as e:
        logger.error(f"Unexpected error for balance_id {balance_id} by user {current_user.username}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected Error: {str(e)}")


# Endpoint to retrieve cached suggestions for a balance ID
@router.get("/{balance_id}")
async def get_cached_suggestions(
    balance_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """
    Get cached financial suggestions for a balance (user must be authenticated)
    """
    try:
        # Check if balance exists and user has access
        db_balance = crud.balance.get_balance(db, balance_id)
        if not db_balance:
            raise HTTPException(status_code=404, detail="Balance not found")
        
        if db_balance.user_id and db_balance.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to this balance")
        
        db_suggestions = crud.suggestion.get_suggestion_cache(db, balance_id)
        if not db_suggestions:
            raise HTTPException(status_code=404, detail="Suggestions not found for this balance ID")
        
        logger.info(f"Retrieved cached suggestions for balance_id {balance_id} by user {current_user.username}")
        return db_suggestions.suggestion_data

    except HTTPException as e:
        logger.error(f"Error retrieving suggestions for balance_id {balance_id} by user {current_user.username}: {e.detail}")
        raise e

# Helper function to fetch financial data from the database
def fetch_financial_data(db: Session, balance_id: int) -> dict:
    """
    Fetch financial data for a specific balance ID
    """
    # Get the balance
    balance = db.query(Balance).filter(Balance.id == balance_id).first()
    if not balance:
        raise HTTPException(status_code=404, detail="Balance not found")

    # Get all incomes for the balance
    incomes = db.query(Income).filter(Income.balance_id == balance_id).all()
    
    # Get all expenses for the balance
    expenses = db.query(Expense).filter(Expense.balance_id == balance_id).all()

    # Calculate totals
    total_income = sum(income.amount for income in incomes)
    total_expense = sum(expense.amount for expense in expenses)

    # Construct and return the financial data dictionary
    financial_data = {
        "balance_id": balance_id,
        "current_balance": balance.amount,
        "total_income": total_income,
        "total_expense": total_expense,
    }

    logger.info(f"Fetched financial data for balance_id {balance_id}: {financial_data}")
    return financial_data

# Helper function to generate suggestions using the LLM microservice
async def generate_suggestions(financial_data: dict):
    """
    Generate financial suggestions using the LLM microservice
    """
    # Validate financial_data
    required_keys = ["balance_id", "current_balance", "total_income", "total_expense"]
    missing_keys = [key for key in required_keys if key not in financial_data]
    if missing_keys:
        logger.error(f"Missing keys in financial_data: {missing_keys}")
        raise HTTPException(status_code=400, detail=f"Missing keys in financial_data: {missing_keys}")

    logger.info(f"Sending financial data to LLM microservice: {financial_data}")

    try:
        # Make a POST request to the LLM microservice
        response = requests.post(LLM_MICROSERVICE_URL, json=financial_data)
        response.raise_for_status()

        # Parse the JSON response
        llm_response = response.json()
        logger.info(f"Received response from LLM microservice")

        return llm_response

    except requests.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM microservice error: {str(e)}")

# Optional: Endpoint to delete cached suggestions (user must own the balance)
@router.delete("/{balance_id}", status_code=204)
async def delete_cached_suggestions(
    balance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """
    Delete cached suggestions for a balance (user must be authenticated)
    """
    try:
        # Check if balance exists and user has access
        db_balance = crud.balance.get_balance(db, balance_id)
        if not db_balance:
            raise HTTPException(status_code=404, detail="Balance not found")
        
        if db_balance.user_id and db_balance.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to this balance")
        
        success = crud.suggestion.delete_suggestion_cache(db, balance_id)
        if not success:
            raise HTTPException(status_code=404, detail="Suggestions not found for this balance ID")
        
        logger.info(f"Deleted cached suggestions for balance_id {balance_id} by user {current_user.username}")
        return {"status": "success"}

    except HTTPException as e:
        logger.error(f"Error deleting suggestions for balance_id {balance_id} by user {current_user.username}: {e.detail}")
        raise e

# Optional: Public endpoint for health check (no authentication required)
@router.get("/public/health")
async def health_check():
    """Public health check endpoint (no authentication required)"""
    return {"status": "healthy", "service": "suggestions"}