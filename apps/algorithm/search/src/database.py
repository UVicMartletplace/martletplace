import asyncpg
from fastapi import HTTPException

from .config import DB_ENDPOINT


async def get_db_connection():
    return await asyncpg.connect(dsn=DB_ENDPOINT)


async def insert_user_search(user_id: int, search_term: str):
    conn = await get_db_connection()
    try:
        insert_query = """
            INSERT INTO user_searches (user_id, search_term)
            VALUES ($1, $2);
        """
        await conn.execute(insert_query, user_id, search_term)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()
