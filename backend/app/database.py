"""
Database configuration and session management.
Uses SQLAlchemy 2.0 async API with asyncpg (PostgreSQL) or aiosqlite (dev/test).
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.engine.url import make_url
from app.config import settings
import logging

logger = logging.getLogger(__name__)

raw_db_url = settings.database_url
_is_sqlite = raw_db_url.startswith("sqlite")

engine_kwargs = {
    "echo": False,
    "future": True,
}

if not _is_sqlite:
    # Use SQLAlchemy native URL parser
    url_obj = make_url(raw_db_url)
    query_dict = dict(url_obj.query)
    query_dict.pop("sslmode", None)
    query_dict.pop("channel_binding", None)
    query_dict.pop("ssl", None)

    # Neon PostgreSQL default database name is 'neondb'
    db_name = url_obj.database
    if not db_name or "%20" in db_name or " " in db_name:
        db_name = "neondb"

    url_obj = url_obj._replace(drivername="postgresql+asyncpg", database=db_name, query=query_dict)
    db_url = url_obj.render_as_string(hide_password=False)

    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["connect_args"] = {"ssl": "require"}
else:
    db_url = raw_db_url

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
