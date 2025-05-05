# backend/app/middleware/validation.py
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class RequestValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Check Content-Type for POST/PUT/PATCH requests that likely have a body
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("Content-Type", "")
            
            # Special case: The suggestions endpoint doesn't require a body
            if "/suggestions/" in request.url.path and request.method == "POST":
                # Allow this request without Content-Type validation
                pass
            # Only enforce Content-Type for non-empty bodies
            elif not content_type.startswith("application/json") and request.headers.get("Content-Length", "0") != "0":
                logger.warning(f"Invalid Content-Type: {content_type} for {request.url.path}")
                return JSONResponse(
                    status_code=415,
                    content={"detail": "Content-Type must be application/json"}
                )
        
        # Proceed with the request
        response = await call_next(request)
        
        # Add security headers to the response
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        return response