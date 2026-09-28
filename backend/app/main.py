from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

import app.models  # ensure models are registered
from app.api.routes import (
    accounts,
    alerts,
    cases,
    dashboard,
    demo,
    detection,
    employees,
    evaluation,
    evidence,
    graph,
    health,
    investigations,
    simulation,
    timeline,
    transactions,
)
from app.config import settings
from app.db.session import Base, engine

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="InsiderTrace — Financial Crime & Insider Risk Intelligence Platform Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Consistent Error Handling
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail
    if isinstance(detail, dict) and "error" in detail:
        return JSONResponse(status_code=exc.status_code, content=detail)

    code = "HTTP_ERROR"
    if exc.status_code == 404:
        code = "NOT_FOUND"
    elif exc.status_code == 403:
        code = "FORBIDDEN"
    elif exc.status_code == 401:
        code = "UNAUTHORIZED"
    elif exc.status_code == 400:
        code = "BAD_REQUEST"

    msg = detail if isinstance(detail, str) else str(detail)
    return JSONResponse(status_code=exc.status_code, content={"error": {"code": code, "message": msg, "details": {}}})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request parameters or payload format",
                "details": exc.errors(),
            }
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please contact the administrator.",
                "details": str(exc),
            }
        },
    )


# Include Routers
app.include_router(health.router)
app.include_router(demo.router)
app.include_router(alerts.router)
app.include_router(cases.router)
app.include_router(evidence.router)
app.include_router(employees.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(graph.router)
app.include_router(timeline.router)
app.include_router(evaluation.router)
app.include_router(simulation.router)
app.include_router(detection.router)
app.include_router(dashboard.router)
app.include_router(investigations.router)
