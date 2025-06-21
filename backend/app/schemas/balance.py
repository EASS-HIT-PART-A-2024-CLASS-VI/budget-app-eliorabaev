from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import re

# Base Schemas
class BalanceBase(BaseModel):
    amount: float = Field(
        gt=0,
        description="The balance amount must be greater than zero",
        example=1000.00
    )
    
    @validator('amount')
    def amount_must_be_reasonable(cls, v):
        if v > 1_000_000_000:  # 1 billion limit
            raise ValueError("Amount exceeds reasonable limits")
        return round(v, 2)  # Round to 2 decimal places

class IncomeBase(BaseModel):
    balance_id: int = Field(gt=0, description="Balance ID must be greater than zero")
    source: str = Field(
        min_length=1,
        max_length=255,
        description="Income source description",
        example="Salary"
    )
    amount: float = Field(
        gt=0,
        description="The income amount must be greater than zero",
        example=2500.00
    )
    
    @validator('source')
    def source_must_be_valid(cls, v):
        if not re.match(r'^[a-zA-Z0-9\s\.,_\-\'\"]+$', v.strip()):
            raise ValueError("Source contains invalid characters")
        return v.strip()
    
    @validator('amount')
    def amount_must_be_reasonable(cls, v):
        if v > 1_000_000_000:  # 1 billion limit
            raise ValueError("Amount exceeds reasonable limits")
        return round(v, 2)  # Round to 2 decimal places

class ExpenseBase(BaseModel):
    balance_id: int = Field(gt=0, description="Balance ID must be greater than zero")
    category: str = Field(
        min_length=1,
        max_length=255,
        description="Expense category description",
        example="Groceries"
    )
    amount: float = Field(
        gt=0,
        description="The expense amount must be greater than zero",
        example=150.00
    )
    
    @validator('category')
    def category_must_be_valid(cls, v):
        if not re.match(r'^[a-zA-Z0-9\s\.,_\-\'\"]+$', v.strip()):
            raise ValueError("Category contains invalid characters")
        return v.strip()
    
    @validator('amount')
    def amount_must_be_reasonable(cls, v):
        if v > 1_000_000_000:  # 1 billion limit
            raise ValueError("Amount exceeds reasonable limits")
        return round(v, 2)  # Round to 2 decimal places


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
        from_attributes = True

class Income(IncomeBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Expense(ExpenseBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Suggestion Cache Schema
class SuggestionCacheCreate(BaseModel):
    balance_id: int
    suggestion_data: dict

class SuggestionCache(SuggestionCacheCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True