from fastapi import FastAPI
from app.graph_microservice.app.routes.graph_routes import router as graph_router

# Create a FastAPI instance
app = FastAPI()

# Include routes
app.include_router(graph_router)