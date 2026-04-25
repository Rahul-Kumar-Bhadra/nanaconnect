import asyncio
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Handle Neon/Postgres async driver if not specified
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# asyncpg does not support 'sslmode' as a query parameter
if "sslmode=" in db_url:
    # Remove sslmode from the URL if it exists
    import urllib.parse
    parsed = urllib.parse.urlparse(db_url)
    query = urllib.parse.parse_qs(parsed.query)
    query.pop('sslmode', None)
    new_query = urllib.parse.urlencode(query, doseq=True)
    db_url = parsed._replace(query=new_query).geturl()

engine = create_async_engine(
    db_url,
    echo=False,
    # Use pool_pre_ping for Postgres to avoid stale connections
    pool_pre_ping=True if "postgresql" in db_url else False,
    # Ensure SSL is enabled for Neon/Postgres if not already in URL
    connect_args={"ssl": "require"} if "postgresql" in db_url else {}
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def create_tables():
    max_retries = 3
    retry_delay = 5
    
    for attempt in range(1, max_retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("✅ Database tables ensured.")
            return
        except Exception as e:
            logger.error(f"❌ Database connection attempt {attempt} failed: {e}")
            if attempt < max_retries:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.error("Max retries reached. Crashing...")
                raise e