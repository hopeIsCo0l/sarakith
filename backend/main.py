import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from aiogram.exceptions import TelegramUnauthorizedError, TelegramAPIError
from config import settings
from bot.instance import create_bot_and_dp
from db.supabase_client import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sara-power-backend")

bot, dp = create_bot_and_dp()

async def run_bot_polling():
    try:
        logger.info("🤖 Starting aiogram 3 Telegram Bot polling loop...")
        await dp.start_polling(bot, handle_signals=False)
    except TelegramUnauthorizedError:
        logger.error(
            "❌ Telegram Error: 401 Unauthorized! The BOT_TOKEN in backend/.env is invalid or revoked. "
            "Please obtain a new bot token from @BotFather and update BOT_TOKEN in backend/.env"
        )
    except TelegramAPIError as e:
        logger.error(f"❌ Telegram API Error: {e}")
    except Exception as e:
        logger.error(f"❌ Telegram Bot Error: {e}", exc_info=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Asynchronous lifespan manager launching Telegram Bot polling in background."""
    logger.info("🚀 Starting FastAPI Server & Telegram Bot Admin Panel...")
    
    polling_task = None
    if settings.BOT_TOKEN and "DEFAULT" not in settings.BOT_TOKEN:
        polling_task = asyncio.create_task(run_bot_polling())
    else:
        logger.warning("⚠️ BOT_TOKEN is unconfigured or default in .env file. Bot polling skipped.")

    yield

    logger.info("🛑 Shutting down FastAPI server & Telegram Bot...")
    if polling_task:
        polling_task.cancel()

app = FastAPI(
    title="Sara Power Solution plc — Solar Equipment API",
    description="Python Async FastAPI & aiogram 3 Telegram Bot Admin Panel Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
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
        "system": "Sara Power Solution plc Catalog API",
        "bot_framework": "aiogram 3 (asyncio)",
        "database": "Supabase PostgreSQL",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    stats = await db.get_stats()
    return {
        "status": "healthy",
        "stats": stats,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
