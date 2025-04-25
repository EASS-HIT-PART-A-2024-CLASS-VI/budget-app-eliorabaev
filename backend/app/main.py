from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import balance, income, expense, suggestions
from core.config import settings
from state import lifespan

app = FastAPI(
    redirect_slashes=True,
    title=settings.app_name,
    version=settings.version,
    debug=settings.debug,  # Enable/Disable debug mode
    lifespan=lifespan
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # Load origins from centralized config
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(balance.router, prefix="/balance", tags=["Balance"])
app.include_router(income.router, prefix="/incomes", tags=["Incomes"])
app.include_router(expense.router, prefix="/expenses", tags=["Expenses"])
app.include_router(suggestions.router, prefix="/suggestions", tags=["Suggestions"])

@app.get("/")
async def read_root():
    return {"message": f"Welcome to {settings.app_name} v{settings.version}"}
