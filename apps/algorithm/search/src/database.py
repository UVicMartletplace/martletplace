import asyncpg
from fastapi import HTTPException

from .config import DB_ENDPOINT
from opentelemetry.instrumentation.asyncpg import AsyncPGInstrumentor

AsyncPGInstrumentor().instrument()

DB_POOL = None

async def initialize_db():
    global DB_POOL
    if not DB_POOL:
        DB_POOL = await asyncpg.create_pool(dsn=DB_ENDPOINT)

async def insert_user_search(user_id: int, search_term: str):
    await initialize_db()
    insert_query = """
        INSERT INTO user_searches (user_id, search_term)
        VALUES ($1, $2);
    """
    async with DB_POOL.acquire() as conn:
        await conn.execute(insert_query, user_id, search_term)
