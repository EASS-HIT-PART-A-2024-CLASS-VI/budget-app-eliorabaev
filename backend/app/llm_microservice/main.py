from fastapi import FastAPI
from llm_service import get_suggestions

app = FastAPI()

@app.post("/suggestions/")
async def get_llm_suggestions(data: dict):
    return await get_suggestions(data)
