from pydantic import BaseModel, Field
from typing import Optional  # Import Optional for optional fields

class Balance(BaseModel):
    # Define the Balance model with an optional ID and amount
    id: Optional[int] = Field(default=None, description="The ID of the balance")
    amount: float

class Income(BaseModel):
    # Define the Income model with an optional ID, balance ID, source, and amount
    id: Optional[int] = Field(default=None, description="The ID of the income")
    balance_id: int
    source: str
    amount: float

class Expense(BaseModel):
    # Define the Expense model with an optional ID, balance ID, category, and amount
    id: Optional[int] = Field(default=None, description="The ID of the expense")
    balance_id: int
    category: str
    amount: float

class UpdateIncome(BaseModel):
    balance_id: Optional[int] = None
    source: Optional[str] = None
    amount: Optional[float] = None

class UpdateExpense(BaseModel):
    balance_id: Optional[int] = None
    category: Optional[str] = None
    amount: Optional[float] = None