from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import select
from api_models import ListingSummary, Review
from sql_models import User
from db import get_session, AsyncSession
from fastapi import Depends
from recommender import Recommender

app = FastAPI()
recommender = Recommender()

@app.get("/api/recommendations", response_model=List[ListingSummary])
async def get_recommendations(authorization: str, page: int = 1, limit: int = 20, session: AsyncSession = Depends(get_session)):
    user_id = int(authorization)
    users = await session.exec(select(User).where(User.id == user_id))
    if not users:
        return HTTPException(status_code=404, detail="User not found")
    user = users.first()
    recommendations = recommender.recommend(user.id)
    # load recommendations into ListingSummary objects
    
    return []


@app.post("/api/user-preferences/stop-suggesting-item/{id}")
async def stop_suggesting_item(authorization: str, id: str):
    # actual logic will go here

    return {"message": "Preference updated successfully."}


@app.put("/api/user-preferences/item-click")
async def item_click(authorization: str, id: str):
    # actual logic will go here

    return {"message": "Item click recorded successfully."}


@app.put("/api/user-preferences/item-buy")
async def item_buy(authorization: str, id: str):
    # actual logic will go here

    return {"message": "Item purchase recorded successfully."}


@app.put("/api/user-preferences/search-term")
async def search_term(authorization: str, search_term: str):
    # actual logic will go here

    return {"message": "Search term recorded successfully."}


@app.put("/api/user-preferences/review-add")
async def review_add(authorization: str, review: Review):
    # actual logic will go here

    return {"message": "Review recorded successfully."}
