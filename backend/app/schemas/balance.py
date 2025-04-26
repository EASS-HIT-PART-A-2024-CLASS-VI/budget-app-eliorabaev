from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Base Schemas
class BalanceBase(BaseModel):
    amount: float = Field(gt=0, description="The balance amount must be greater than zero")

class IncomeBase(BaseModel):
    balance_id: int
    source: str
    amount: float

class ExpenseBase(BaseModel):
    balance_id: int
    category: str
    amount: float

# Create Schemas
class BalanceCreate(BalanceBase):
    pass

class IncomeCreate(IncomeBase):
    pass

class ExpenseCreate(ExpenseBase):
    pass

# Update Schemas
class BalanceUpdate(BaseModel):
    amount: Optional[float] = None

class IncomeUpdate(BaseModel):
    balance_id: Optional[int] = None
    source: Optional[str] = None
    amount: Optional[float] = None

class ExpenseUpdate(BaseModel):
    balance_id: Optional[int] = None
    category: Optional[str] = None
    amount: Optional[float] = None

# Response Schemas
class Balance(BalanceBase):
    id: int
    
    class Config:
        orm_mode = True
        from_attributes = True

class Income(IncomeBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
        from_attributes = True

class Expense(ExpenseBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
        from_attributes = True

# Suggestion Cache Schema
class SuggestionCacheCreate(BaseModel):
    balance_id: int
    suggestion_data: dict

class SuggestionCache(SuggestionCacheCreate):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
        from_attributes = True