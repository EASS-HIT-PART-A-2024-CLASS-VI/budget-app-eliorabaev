from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import balance, income, expense, suggestions
from core.config import settings
from db import init_db
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan context manager to initialize the database at startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database with error handling
    try:
        logger.info("Initializing database...")
        init_db()
        logger.info("Database initialization complete!")
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        logger.warning("Application will continue but may not function correctly without database.")
    
    yield

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

@app.get("/health")
async def health_check():
    return {"status": "healthy"}