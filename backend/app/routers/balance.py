from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import crud
from db.database import get_db
from schemas.balance import Balance, BalanceCreate, BalanceUpdate
import httpx

router = APIRouter()

GRAPH_MICROSERVICE_URL = "http://graph_microservice:8002"  # Keep existing URL

@router.post("/", response_model=Balance)
async def create_balance_endpoint(balance: BalanceCreate, db: Session = Depends(get_db)):
    return crud.balance.create_balance(db, balance)

@router.get("/{balance_id}", response_model=Balance)
async def get_balance_endpoint(balance_id: int, db: Session = Depends(get_db)):
    db_balance = crud.balance.get_balance(db, balance_id)
    if db_balance is None:
        raise HTTPException(status_code=404, detail="Balance not found")
    return db_balance

@router.patch("/{balance_id}", response_model=Balance)
async def update_balance_endpoint(balance_id: int, balance: BalanceUpdate, db: Session = Depends(get_db)):
    db_balance = crud.balance.update_balance(db, balance_id, balance)
    if db_balance is None:
        raise HTTPException(status_code=404, detail="Balance not found")
    return db_balance

@router.delete("/{balance_id}", status_code=204)
async def delete_balance_endpoint(balance_id: int, db: Session = Depends(get_db)):
    success = crud.balance.delete_balance(db, balance_id)
    if not success:
        raise HTTPException(status_code=404, detail="Balance not found")
    return {"status": "success"}

@router.get("/{balance_id}/graph")
async def get_balance_graph(balance_id: int, db: Session = Depends(get_db)):
    """
    Fetch balance graph data and projected revenue from the graph_microservice.
    """
    # First verify that the balance exists
    db_balance = crud.balance.get_balance(db, balance_id)
    if db_balance is None:
        raise HTTPException(status_code=404, detail="Balance not found")
    
    async with httpx.AsyncClient() as client:
        try:
            balance_response = await client.get(f"{GRAPH_MICROSERVICE_URL}/balance-graph/{balance_id}")
            if balance_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Graph data not found for this balance ID")
            balance_response.raise_for_status()
            balance_graph = balance_response.json()

            revenue_response = await client.get(f"{GRAPH_MICROSERVICE_URL}/projected-revenue/{balance_id}")
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