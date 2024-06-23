from typing import List
from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.sql_models import Users, User_Clicks, User_Searches
from src.api_models import ListingSummary, Review
from src.db import get_session
from src.recommender import Recommender

app = FastAPI()
recommender = Recommender()


@app.get("/api/recommendations", response_model=List[ListingSummary])
async def get_recommendations(
    authorization: str,
    page: int = 1,
    limit: int = 20,
    session: AsyncSession = Depends(get_session),
):
    user_id = 5  # TODO need to do it based on auth
    users = await session.exec(select(Users).where(Users.user_id == user_id))
    if not users:
        return HTTPException(status_code=404, detail="User not found")

    items_clicked = await session.exec(
        select(User_Clicks).where(User_Clicks.user_id == user_id)
    )
    items_clicked = [item.listing_id for item in items_clicked]

    terms_searched = await session.exec(
        select(User_Searches).where(User_Searches.user_id == user_id)
    )
    terms_searched = [term.search_term for term in terms_searched]

    recommended_listings = recommender.recommend(
        items_clicked, terms_searched, page, limit
    )

    listing_summaries = [
        ListingSummary(
            listingID=row["listingID"],
            sellerID=row["sellerID"],
            sellerName=row["sellerName"],
            title=row["title"],
            description=row["description"],
            price=row["Price"],
            dateCreated=row["dateCreated"],
            imageUrl=row["imageUrl"],
        )
        for _, row in recommended_listings.iterrows()
    ]

    return listing_summaries


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
