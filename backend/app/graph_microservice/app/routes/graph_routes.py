from fastapi import APIRouter, HTTPException, Path, Query
import httpx
from datetime import datetime
from app.models.graph_models import BalanceGraphData, ProjectedRevenueData

router = APIRouter()

# Backend URL
BACKEND_URL = "http://backend:8000"  # Use Docker Compose service name for backend


@router.get("/balance-graph/{balance_id}", response_model=list[BalanceGraphData])
async def get_balance_graph(
    balance_id: int = Path(..., description="The ID of the balance"),
    year: int = Query(default=None, description="Year to calculate the balance graph"),
):
    """Fetch data for the given balance ID and compute the balance graph incrementally per month."""
    try:
        # Default year to 5 years from now if not provided
        current_year = datetime.now().year
        target_year = year or current_year + 5

        async with httpx.AsyncClient() as client:
            # Fetch the user's balance
            balance_response = await client.get(f"{BACKEND_URL}/balance/{balance_id}")
            balance_response.raise_for_status()
            balance = balance_response.json()

            # Fetch incomes for this balance
            income_response = await client.get(f"{BACKEND_URL}/incomes/", params={"balance_id": balance_id})
            income_response.raise_for_status()
            incomes = income_response.json()

            # Fetch expenses for this balance
            expense_response = await client.get(f"{BACKEND_URL}/expenses/", params={"balance_id": balance_id})
            expense_response.raise_for_status()
            expenses = expense_response.json()

        # Compute the balance per month
        monthly_income = sum(item["amount"] for item in incomes)
        monthly_expense = sum(item["amount"] for item in expenses)
        current_balance = balance["amount"]

        results = []
        for year in range(current_year, target_year + 1):
            for _ in range(12):  # 12 months in a year
                current_balance += (monthly_income - monthly_expense)
            results.append(BalanceGraphData(year=year, balance=current_balance))

        return results
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projected-revenue/{balance_id}", response_model=list[ProjectedRevenueData])
async def get_projected_revenue(
    balance_id: int = Path(..., description="The ID of the balance"),
    year: int = Query(default=None, description="Year to calculate the projected revenue"),
):
    """Fetch data for the given balance ID and compute the projected revenue with correct yearly compounding."""
    try:
        # Default year to 5 years from now if not provided
        current_year = datetime.now().year
        target_year = year or current_year + 5

        async with httpx.AsyncClient() as client:
            # Fetch the user's balance
            balance_response = await client.get(f"{BACKEND_URL}/balance/{balance_id}")
            balance_response.raise_for_status()
            balance = balance_response.json()

            # Fetch incomes for this balance
            income_response = await client.get(f"{BACKEND_URL}/incomes/", params={"balance_id": balance_id})
            income_response.raise_for_status()
            incomes = income_response.json()

            # Fetch expenses for this balance
            expense_response = await client.get(f"{BACKEND_URL}/expenses/", params={"balance_id": balance_id})
            expense_response.raise_for_status()
            expenses = expense_response.json()

        # Compute the projected revenue per year
        monthly_income = sum(item["amount"] for item in incomes)
        monthly_expense = sum(item["amount"] for item in expenses)
        annual_contribution = (monthly_income - monthly_expense) * 12
        current_balance = balance["amount"]

        results = []
        for year in range(current_year, target_year + 1):
            current_balance += annual_contribution  # Add yearly savings
            current_balance *= 1.08  # Apply 8% yearly growth (compounded annually)
            results.append(ProjectedRevenueData(year=year, projected_balance=current_balance))

        return results
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
