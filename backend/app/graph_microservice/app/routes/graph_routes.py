from fastapi import APIRouter, HTTPException, Path, Query
import httpx
from datetime import datetime
from app.models.graph_models import BalanceGraphData, ProjectedRevenueData

router = APIRouter()

# Backend URL
BACKEND_URL = "http://backend:8000"

@router.get("/balance-graph/{balance_id}", response_model=list[BalanceGraphData])
async def get_balance_graph(
    balance_id: int = Path(..., description="The ID of the balance"),
    year: int = Query(default=None, description="Year to calculate the balance graph"),
):
    """Fetch data for the given balance ID and compute the balance graph incrementally per month."""
    try:
        async with httpx.AsyncClient() as client:
            balance_response = await client.get(f"{BACKEND_URL}/balance/{balance_id}")

            if balance_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Balance not found")

            try:
                balance_response.raise_for_status()
            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=e.response.status_code, detail=str(e))

            balance = balance_response.json()

            # Fetch incomes and expenses only if the balance exists
            income_response = await client.get(f"{BACKEND_URL}/incomes/", params={"balance_id": balance_id})
            expense_response = await client.get(f"{BACKEND_URL}/expenses/", params={"balance_id": balance_id})

            if income_response.status_code == 404 and expense_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Income and Expense data not found")

            if income_response.status_code == 404:
                incomes = []
            else:
                income_response.raise_for_status()
                incomes = income_response.json()

            if expense_response.status_code == 404:
                expenses = []
            else:
                expense_response.raise_for_status()
                expenses = expense_response.json()

        # Compute the balance graph
        current_year = datetime.now().year
        target_year = year or current_year + 15
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
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/projected-revenue/{balance_id}", response_model=list[ProjectedRevenueData])
async def get_projected_revenue(
    balance_id: int = Path(..., description="The ID of the balance"),
    year: int = Query(default=None, description="Year to calculate the projected revenue"),
):
    """Fetch data for the given balance ID and compute the projected revenue with yearly compounding."""
    try:
        async with httpx.AsyncClient() as client:
            balance_response = await client.get(f"{BACKEND_URL}/balance/{balance_id}")

            if balance_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Balance not found")

            try:
                balance_response.raise_for_status()
            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=e.response.status_code, detail=str(e))

            balance = balance_response.json()

            # Fetch incomes and expenses only if the balance exists
            income_response = await client.get(f"{BACKEND_URL}/incomes/", params={"balance_id": balance_id})
            expense_response = await client.get(f"{BACKEND_URL}/expenses/", params={"balance_id": balance_id})

            if income_response.status_code == 404 and expense_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Income and Expense data not found")

            if income_response.status_code == 404:
                incomes = []
            else:
                income_response.raise_for_status()
                incomes = income_response.json()

            if expense_response.status_code == 404:
                expenses = []
            else:
                expense_response.raise_for_status()
                expenses = expense_response.json()

        # Compute projected revenue
        current_year = datetime.now().year
        target_year = year or current_year + 15
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
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
