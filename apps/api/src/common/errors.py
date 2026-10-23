from typing import Any
import logging
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("uvicorn.error")

class AppError(Exception):
    def __init__(
        self,
        message: str,
        code: str = "BAD_REQUEST",
        status_code: int = 400,
        details: list[dict[str, Any]] | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or []

class FileValidationError(AppError):
    def __init__(self, message: str, details: list[dict[str, Any]] | None = None):
        super().__init__(message, code="FILE_VALIDATION_ERROR", status_code=400, details=details)

class JobNotFoundError(AppError):
    def __init__(self, job_id: str):
        super().__init__(f"Formatting job '{job_id}' was not found or has expired.", code="JOB_NOT_FOUND", status_code=404)

class DocumentProcessingError(AppError):
    def __init__(self, message: str, details: list[dict[str, Any]] | None = None):
        super().__init__(message, code="PROCESSING_ERROR", status_code=422, details=details)

async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "req-unknown")
    logger.error(f"[Validation Error 422] Path: {request.url.path} Errors: {exc.errors()}")
    err_msgs = [f"{' -> '.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "; ".join(err_msgs),
                "details": exc.errors(),
                "requestId": request_id,
            }
        },
    )

async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "req-unknown")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
                "requestId": request_id,
            }
        },
    )

async def general_error_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "req-unknown")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred during document processing.",
                "details": [],
                "requestId": request_id,
            }
        },
    )
