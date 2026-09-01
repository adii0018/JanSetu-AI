"""
Database configuration and session management.
Uses SQLAlchemy 2.0 async API with asyncpg (PostgreSQL) or aiosqlite (dev/test).
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Detect driver to set engine options appropriately
_is_sqlite = settings.database_url.startswith("sqlite")

engine_kwargs = {
    "echo": False,
    "future": True,
}

# pool_pre_ping is not supported by aiosqlite
if not _is_sqlite:
    engine_kwargs["pool_pre_ping"] = True

engine = create_async_engine(settings.database_url, **engine_kwargs)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for ORM models
Base = declarative_base()


async def get_db():
    """
    Dependency function to get database session.
    Yields an async session and ensures it's closed after use.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    Initialize database tables.
    Creates all tables defined in models.
    """
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error("Failed to initialize database tables", exc_info=False)
        raise


async def close_db():
    """
    Close database connections.
    Should be called on application shutdown.
    """
    try:
        await engine.dispose()
        logger.info("Database connections closed successfully")
    except Exception as e:
        logger.error("Error closing database connections", exc_info=False)
