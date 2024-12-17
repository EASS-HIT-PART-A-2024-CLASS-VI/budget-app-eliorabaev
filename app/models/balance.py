from pydantic import BaseModel, Field
from typing import Optional

class Balance(BaseModel):
    id: Optional[int] = Field(default=None, description="The ID of the balance")
    amount: float

class Income(BaseModel):
    id: Optional[int] = Field(default=None, description="The ID of the income")
    balance_id: int
    source: str
    amount: float

class Expense(BaseModel):
    id: Optional[int] = Field(default=None, description="The ID of the expense")
    balance_id: int
    category: str
    amount: float
