from fastapi import APIRouter, Request
from typing import List
from services.suggestion_service import generate_suggestions

router = APIRouter()

@router.get("/{balance_id}", response_model=List[str])
async def get_suggestions(request: Request, balance_id: int):
    return await generate_suggestions(request, balance_id)
