from fastapi import APIRouter
from app.services.llm_service import get_suggestions

router = APIRouter()

@router.post("/suggestions/")
async def get_llm_suggestions(data: dict):
    return await get_suggestions(data)
