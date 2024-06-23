from fastapi import FastAPI

from .routes import search_router

app = FastAPI()

app.include_router(search_router)
