from fastapi import FastAPI
import uvicorn
from app.routes.graph_routes import router as graph_router

# Create a FastAPI instance
app = FastAPI()

# Include routes
app.include_router(graph_router)