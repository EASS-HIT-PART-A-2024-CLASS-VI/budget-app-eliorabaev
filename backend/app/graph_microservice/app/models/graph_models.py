from pydantic import BaseModel

class BalanceGraphData(BaseModel):
    year: int
    balance: float

class ProjectedRevenueData(BaseModel):
    year: int
    projected_balance: float
