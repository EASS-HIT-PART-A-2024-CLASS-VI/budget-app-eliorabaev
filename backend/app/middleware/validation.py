# backend/app/middleware/validation.py
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import json
from typing import Dict, Any, Callable
import logging

logger = logging.getLogger(__name__)

class RequestValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Check Content-Type for POST/PUT/PATCH requests
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("Content-Type", "")
            if not content_type.startswith("application/json"):
                logger.warning(f"Invalid Content-Type: {content_type}")
                return HTTPException(
                    status_code=415,
                    detail="Content-Type must be application/json"
                )
            
            # Validate request body if it's JSON
            try:
                body = await request.body()
                if body:
                    try:
                        payload = json.loads(body)
                        # Body size validation
                        if len(body) > 1024 * 1024:  # 1MB limit
                            logger.warning(f"Request body too large: {len(body)} bytes")
                            raise HTTPException(
                                status_code=413,
                                detail="Request body too large"
                            )
                    except json.JSONDecodeError:
                        logger.warning("Invalid JSON in request body")
                        raise HTTPException(
                            status_code=400,
                            detail="Invalid JSON in request body"
                        )
            except Exception as e:
                logger.error(f"Error validating request: {str(e)}")
                
        response = await call_next(request)
        return response