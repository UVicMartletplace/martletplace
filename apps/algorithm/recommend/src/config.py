import os

DB_ENDPOINT = os.getenv("DB_ENDPOINT").replace("postgres://", "postgresql+asyncpg://")
