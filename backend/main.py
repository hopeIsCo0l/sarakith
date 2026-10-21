import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from db.supabase_client import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sara-power-backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Service lifecycle. The catalog is served by the Next.js frontend."""
    logger.info("🚀 Starting Sara Power Solution status service...")
    yield
    logger.info("🛑 Shutting down Sara Power Solution status service...")


app = FastAPI(
    title="Sara Power Solution plc — Status API",
    description="Health and catalog statistics service for the Sara Power Solution showcase.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware — the public frontend origin only.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "status": "online",
        "system": "Sara Power Solution plc Platform",
        "frontend": settings.FRONTEND_URL,
        "version": "1.0.0",
    }


@app.get("/api/health")
async def health_check():
    stats = await db.get_stats()
    return {
        "status": "healthy",
        "stats": stats,
        "environment": settings.ENVIRONMENT,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
