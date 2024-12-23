from fastapi import FastAPI
from routers import balance, income, expense, suggestions
from core.config import settings
from state import lifespan

app = FastAPI(lifespan=lifespan)

# Include routers
app.include_router(balance.router, prefix="/balance", tags=["Balance"])
app.include_router(income.router, prefix="/incomes", tags=["Incomes"])
app.include_router(expense.router, prefix="/expenses", tags=["Expenses"])
app.include_router(suggestions.router, prefix="/suggestions", tags=["Suggestions"])

@app.get("/")
async def read_root():
    return {"message": f"Welcome to {settings.app_name} v{settings.version}"}
