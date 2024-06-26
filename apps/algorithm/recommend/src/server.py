import ast
import re
from typing import List
from fastapi import FastAPI, HTTPException, Depends, Header
import pandas as pd
from sqlalchemy import insert
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.sql_models import User_Preferences, Users, User_Clicks, User_Searches
from src.api_models import ListingSummary
from src.db import get_session
from src.recommender import Recommender

app = FastAPI()
recommender = Recommender()


@app.get("/api/recommendations", response_model=List[ListingSummary])
async def get_recommendations(
    authorization: str = "5",
    page: int = 1,
    limit: int = 20,
    session: AsyncSession = Depends(get_session),
):
    user_id = int(authorization) if authorization.isdigit() else None
    users = await session.exec(select(Users).where(Users.user_id == user_id))
    user = users.first()
    if user is None:
        raise HTTPException(
            status_code=404, detail="User not found: " + str(authorization)
        )

    items_clicked = await session.exec(
        select(User_Clicks).where(User_Clicks.user_id == user_id)
    )
    items_clicked = [item.listing_id for item in items_clicked]

    terms_searched = await session.exec(
        select(User_Searches).where(User_Searches.user_id == user_id)
    )
    terms_searched = [term.search_term for term in terms_searched]

    await session.close()
    recommended_listings = recommender.recommend(
        items_clicked, terms_searched, page, limit
    )
    if recommended_listings.size == 0:
        return []
    # replace rows with NaN values with 0s
    recommended_listings = recommended_listings.fillna(0)

    columns = [
        "listing_id",
        "seller_id",
        "buyer_id",
        "title",
        "price",
        "location",
        "status",
        "description",
        "image_urls",
        "created_at",
        "modified_at",
        "combined_features",
    ]

    recommended_listings = pd.DataFrame(recommended_listings, columns=columns)

    listing_summaries = []
    for _, row in recommended_listings.iterrows():
        # this is so cursed, but since image urls are stored as a string of a python list, we gotta do this
        try:
            img_urls = ast.literal_eval(row["image_urls"])
        except (ValueError, SyntaxError):
            img_urls = []
        # the locations are stored as html 💀 so parse out the longitude and latitude
        pattern = re.compile(r"latitude=([-\d\.]+) longitude=([-\d\.]+)")
        match = pattern.search(row["location"])
        if match:
            latitude, longitude = match.groups()
            loc = {"latitude": float(latitude), "longitude": float(longitude)}
        else:
            loc = {"latitude": 0, "longitude": 0}
        listing_summary = ListingSummary(
            listingID=row["listing_id"],
            sellerID=row["seller_id"],
            # Will query for actual seller name later.
            sellerName="Seller",
            buyerID=row["buyer_id"],
            title=str(row["title"]),
            price=row["price"],
            location=loc,
            status=str(row["status"]),
            description=str(row["description"]),
            imageUrl=str(img_urls[0]),
            dateCreated=row["created_at"],
            modified_at=row["modified_at"],
        )
        listing_summaries.append(listing_summary)
    return listing_summaries


@app.post("/api/recommendations/stop/{id}")
async def stop_suggesting_item(
    id: str,
    authorization: str = Header(None),
    session: AsyncSession = Depends(get_session),
):
    user_id = int(authorization) if authorization.isdigit() else None
    users = await session.exec(select(Users).where(Users.user_id == user_id))
    user = users.first()
    if user is None:
        raise HTTPException(
            status_code=404, detail="User not found: " + str(authorization)
        )

    await session.exec(
        insert(
            User_Preferences,
            values={"user_id": user_id, "listing_id": id, "weight": 1.0},
        )
    )

    return {"message": "Preference updated successfully."}


# @app.put("/api/user-preferences/item-click")
# async def item_click(authorization: str, id: str):
#     # actual logic will go here

#     return {"message": "Item click recorded successfully."}


# @app.put("/api/user-preferences/item-buy")
# async def item_buy(authorization: str, id: str):
#     # actual logic will go here

#     return {"message": "Item purchase recorded successfully."}


# @app.put("/api/user-preferences/search-term")
# async def search_term(authorization: str, search_term: str):
#     # actual logic will go here

#     return {"message": "Search term recorded successfully."}


# @app.put("/api/user-preferences/review-add")
# async def review_add(authorization: str, review: Review):
#     # actual logic will go here

#     return {"message": "Review recorded successfully."}
