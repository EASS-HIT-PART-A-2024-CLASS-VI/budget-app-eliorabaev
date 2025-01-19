from pydantic import BaseModel, Field
from typing import List, Optional


class Suggestion(BaseModel):
    # Represents a single suggestion from the LLM
    category: str = Field(
        ..., 
        description="The category of the suggestion, e.g., 'Analysis', 'Savings', 'Investing'.",
        min_length=3
    )
    details: str = Field(
        ..., 
        description="Detailed advice or explanation for the category. Markdown supported for formatting."
    )
    priority: int = Field(
        ..., 
        description="Priority level of the suggestion, where 1 is the highest priority.",
        ge=1,  # Minimum value is 1
        le=10  # Maximum value is 10
    )
    actionable: Optional[bool] = Field(
        default=True, 
        description="Whether this suggestion is immediately actionable by the user."
    )
    reference_url: Optional[str] = Field(
        None, 
        description="A reference link for further reading or resources."
    )


class Analysis(BaseModel):
    # High-level analysis of the user's financial situation
    cash_flow_status: str = Field(
        ..., 
        description="A description of the user's cash flow status, e.g., 'Positive', 'Negative', or 'Neutral'."
    )
    summary: str = Field(
        ..., 
        description="A concise summary of the user's financial situation."
    )
    warnings: Optional[List[str]] = Field(
        default=[], 
        description="Optional warnings or red flags identified in the user's financial data."
    )


class LLMResponse(BaseModel):
    # Represents the structured response from the LLM
    balance_id: int = Field(
        ..., 
        description="The balance ID associated with these suggestions.",
        gt=0  # Ensure the balance ID is a positive integer
    )
    current_balance: float = Field(
        ..., 
        description="The user's current financial balance. Must be non-negative.",
        ge=0
    )
    total_income: float = Field(
        ..., 
        description="The user's total income. Must be non-negative.",
        ge=0
    )
    total_expense: float = Field(
        ..., 
        description="The user's total expense. Must be non-negative.",
        ge=0
    )
    analysis: Analysis = Field(
        ..., 
        description="High-level financial analysis provided by the LLM."
    )
    suggestions: List[Suggestion] = Field(
        ..., 
        description="A list of structured financial suggestions ordered by priority."
    )
    generated_at: Optional[str] = Field(
        None, 
        description="Timestamp indicating when the response was generated."
    )
