from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Suggestion(BaseModel):
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
    impact: Optional[str] = Field(
        None,
        description="The potential financial impact of the suggestion, e.g., 'High', 'Medium', 'Low'."
    )
    level_of_effort: Optional[str] = Field(
        None,
        description="The effort required to implement the suggestion, e.g., 'Low', 'Medium', 'High'."
    )
    actionable: Optional[bool] = Field(
        default=True, 
        description="Whether this suggestion is immediately actionable by the user."
    )
    steps: Optional[List[str]] = Field(
        default=[],
        description="Specific steps to implement the suggestion."
    )
    reference_url: Optional[str] = Field(
        None, 
        description="A reference link for further reading or resources."
    )

class Analysis(BaseModel):
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
    positives: Optional[List[str]] = Field(
        default=[],
        description="Optional positives or highlights in the user's financial data."
    )

class SWOT(BaseModel):
    strengths: List[str] = Field(
        default=[],
        description="Strengths in the user's financial situation."
    )
    weaknesses: List[str] = Field(
        default=[],
        description="Weaknesses in the user's financial situation."
    )
    opportunities: List[str] = Field(
        default=[],
        description="Opportunities for improving the user's financial situation."
    )
    threats: List[str] = Field(
        default=[],
        description="Potential threats or risks in the user's financial situation."
    )

class LLMResponse(BaseModel):
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
    swot: SWOT = Field(
        ..., 
        description="SWOT analysis of the user's financial situation."
    )
    suggestions: List[Suggestion] = Field(
        default=[],
        description="A list of structured financial suggestions ordered by priority."
    )
    generated_at: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Timestamp indicating when the response was generated."
    )
