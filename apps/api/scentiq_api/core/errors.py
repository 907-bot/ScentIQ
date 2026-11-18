"""Custom exceptions and centralized error handlers for ScentIQ API."""

import uuid
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse


class ScentIQException(HTTPException):
    def __init__(self, code: str, message: str, status_code: int = 400):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message


async def scentiq_exception_handler(request: Request, exc: ScentIQException) -> JSONResponse:
    request_id = request.headers.get("x-request-id", f"req_{uuid.uuid4().hex[:10]}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "request_id": request_id
            }
        }
    )


async def general_http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    request_id = request.headers.get("x-request-id", f"req_{uuid.uuid4().hex[:10]}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": "HTTP_ERROR",
                "message": str(exc.detail),
                "request_id": request_id
            }
        }
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = request.headers.get("x-request-id", f"req_{uuid.uuid4().hex[:10]}")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred processing the molecular request.",
                "request_id": request_id
            }
        }
    )
