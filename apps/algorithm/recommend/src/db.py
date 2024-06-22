from .config import DB_ENDPOINT
from sqlmodel import create_engine
from sqlmodel.ext.asyncio.session import AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator

engine = AsyncEngine(create_engine(DB_ENDPOINT, future=True))

async def get_session() -> AsyncGenerator[AsyncSession, None, None]:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        yield session
