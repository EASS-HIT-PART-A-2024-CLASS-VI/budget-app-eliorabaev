from fastapi import APIRouter, Request, HTTPException
from models.balance import Balance
from services.balance_service import create_balance, retrieve_balance, update_balance, delete_balance
import httpx

router = APIRouter()

GRAPH_MICROSERVICE_URL = "http://graph_microservice:8002"  # Update port if necessary

@router.post("/", response_model=Balance)
async def set_balance(request: Request, new_balance: Balance):
    return await create_balance(request, new_balance)

@router.get("/{balance_id}", response_model=Balance)
async def get_balance(request: Request, balance_id: int):
    return await retrieve_balance(request, balance_id)

@router.patch("/{balance_id}", response_model=Balance)
async def patch_balance_endpoint(request: Request, balance_id: int, updated_balance: Balance):
    return await update_balance(request, balance_id, updated_balance)

@router.delete("/{balance_id}", status_code=204)
async def delete_balance_endpoint(request: Request, balance_id: int):
    await delete_balance(request, balance_id)

@router.get("/{balance_id}/graph")
async def get_balance_graph(balance_id: int):
    """
    Fetch balance graph data and projected revenue from the graph_microservice.
    """
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