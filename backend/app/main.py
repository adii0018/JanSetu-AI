"""
JanSetu Backend - Main FastAPI Application
Digital Public Good platform for citizen complaint management and policymaker insights.
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
from app.database import init_db, close_db, AsyncSessionLocal
from app.seed_data import seed_wards, seed_complaints
from app.routes import complaints, dashboard, wards, tts, whatsapp, ml_cluster
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events.
    Handles startup (database initialization, seeding) and shutdown (cleanup).
    """
    # Startup
    logger.info("Starting JanSetu Backend...")
    
    # Initialize database tables
    await init_db()
    logger.info("Database tables initialized")
    
    # Seed initial data
    async with AsyncSessionLocal() as session:
        await seed_wards(session)
        await seed_complaints(session)
    
    logger.info("JanSetu Backend ready!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down JanSetu Backend...")
    await close_db()
    logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title="JanSetu",
    description="Digital Public Good platform for citizen complaint management",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Attach rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS with environment-based origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler to prevent leaking sensitive information.
    Logs full error details but returns generic message to client.
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred. Please try again later."
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle Pydantic validation errors with consistent format.
    """
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation error",
            "detail": exc.errors()
        }
    )


# Health check endpoint
@app.get("/", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Returns service status for monitoring and load balancers.
    """
    return {
        "status": "ok",
        "service": "JanSetu Backend"
    }

# Include routers
app.include_router(complaints.router)
app.include_router(dashboard.router)
app.include_router(wards.router)
app.include_router(tts.router)
app.include_router(whatsapp.router)
app.include_router(ml_cluster.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
