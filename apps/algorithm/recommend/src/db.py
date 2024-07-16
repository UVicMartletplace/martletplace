from .config import DB_ENDPOINT
from sqlmodel import create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

SQLAlchemyInstrumentor().instrument()

engine = AsyncEngine(create_engine(DB_ENDPOINT, future=True))


async def get_session() -> AsyncGenerator:
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        yield session


async def get_async_session():
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    return async_session()
