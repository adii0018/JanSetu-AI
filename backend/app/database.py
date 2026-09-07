"""
Database configuration and session management.
Uses SQLAlchemy 2.0 async API with asyncpg (PostgreSQL) or aiosqlite (dev/test).
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings
import logging

import urllib.parse

logger = logging.getLogger(__name__)

db_url = settings.database_url
_is_sqlite = db_url.startswith("sqlite")

engine_kwargs = {
    "echo": False,
    "future": True,
}

if not _is_sqlite:
    # Fix scheme for asyncpg
    if db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgres://") and not db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)

    # Strip query parameters that asyncpg driver doesn't accept
    parsed = urllib.parse.urlparse(db_url)
    query_dict = urllib.parse.parse_qs(parsed.query)
    query_dict.pop("sslmode", None)
    query_dict.pop("channel_binding", None)
    query_dict.pop("ssl", None)

    clean_query = urllib.parse.urlencode(query_dict, doseq=True)
    db_url = urllib.parse.urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        clean_query,
        parsed.fragment
    ))

    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["connect_args"] = {"ssl": "require"}

engine = create_async_engine(db_url, **engine_kwargs)

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
