from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List

import crud
from db.database import get_db
from schemas.balance import Balance, BalanceCreate, BalanceUpdate
from dependencies import validate_balance_id, validate_pagination
from core.auth_dependencies import get_current_user
from db.models import User
import httpx

router = APIRouter()

GRAPH_MICROSERVICE_URL = "http://graph_microservice:8002"

@router.get("/public/health")
async def health_check():
    """Public health check endpoint (no authentication required)"""
    return {"status": "healthy", "service": "balance"}

@router.get("/", response_model=List[Balance])
async def get_user_balances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all balances for the current user"""
    balances = db.query(Balance).filter(Balance.user_id == current_user.id).all()
    return balances

@router.get("/current", response_model=Balance)
async def get_current_user_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the user's primary/first balance"""
    balance = db.query(Balance).filter(Balance.user_id == current_user.id).first()
    if not balance:
        raise HTTPException(status_code=404, detail="No balance found. Please create one first.")
    return balance

@router.post("/", response_model=Balance)
async def create_balance_endpoint(
    balance: BalanceCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new balance for the authenticated user"""
    # Create balance with user association
    db_balance = Balance(amount=balance.amount, user_id=current_user.id)
    db.add(db_balance)
    db.commit()
    db.refresh(db_balance)
    return db_balance

@router.get("/{balance_id}", response_model=Balance)
async def get_balance_endpoint(
    balance_id: int = Depends(validate_balance_id), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Get a balance by ID (user must be authenticated)"""
    db_balance = crud.balance.get_balance(db, balance_id)
    if db_balance is None:
        raise HTTPException(status_code=404, detail="Balance not found")
    
    # Optional: Add user ownership check
    # if db_balance.user_id and db_balance.user_id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Access denied")
    
    return db_balance

@router.patch("/{balance_id}", response_model=Balance)
async def update_balance_endpoint(
    balance_id: int = Depends(validate_balance_id), 
    balance: BalanceUpdate = None, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Update a balance (user must be authenticated)"""
    db_balance = crud.balance.update_balance(db, balance_id, balance)
    if db_balance is None:
        raise HTTPException(status_code=404, detail="Balance not found")
    
    # Optional: Add user ownership check
    # if db_balance.user_id and db_balance.user_id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Access denied")
    
    return db_balance

@router.delete("/{balance_id}", status_code=204)
async def delete_balance_endpoint(
    balance_id: int = Depends(validate_balance_id), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """Delete a balance (user must be authenticated)"""
    success = crud.balance.delete_balance(db, balance_id)
    if not success:
        raise HTTPException(status_code=404, detail="Balance not found")
    return {"status": "success"}

@router.get("/{balance_id}/graph")
async def get_balance_graph(
    request: Request,  # Add request to get authorization header
    balance_id: int = Depends(validate_balance_id), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT Protection
):
    """
    Fetch balance graph data and projected revenue from the graph_microservice.
    (user must be authenticated)
    """
    # First verify that the balance exists
    db_balance = crud.balance.get_balance(db, balance_id)
    if db_balance is None:
        raise HTTPException(status_code=404, detail="Balance not found")
    
    if db_balance.user_id and db_balance.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Extract the Authorization header to forward to graph microservice
    auth_header = request.headers.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Prepare headers to forward to graph microservice
    headers = {"Authorization": auth_header}
    
    async with httpx.AsyncClient() as client:
        try:
            # Forward JWT token to graph microservice
            balance_response = await client.get(
                f"{GRAPH_MICROSERVICE_URL}/balance-graph/{balance_id}",
                headers=headers
            )
            if balance_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Graph data not found for this balance ID")
            balance_response.raise_for_status()
            balance_graph = balance_response.json()

            revenue_response = await client.get(
                f"{GRAPH_MICROSERVICE_URL}/projected-revenue/{balance_id}",
                headers=headers
            )
            if revenue_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Projected revenue not found for this balance ID")
            revenue_response.raise_for_status()
            projected_revenue = revenue_response.json()

            return {
                "balance_graph": balance_graph,
                "projected_revenue": projected_revenue
            }

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Balance graph data not found")
            raise HTTPException(status_code=e.response.status_code, detail=f"Graph service error: {str(e)}")

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

