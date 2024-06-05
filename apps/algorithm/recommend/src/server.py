from typing import List

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


# Define Pydantic models
class ListingSummary(BaseModel):
    listingID: str = Field(..., example="A23F29039B23")
    sellerID: str = Field(..., example="A23F29039B23")
    sellerName: str = Field(..., example="John Johnson")
    title: str = Field(..., example="Used Calculus Textbook")
    description: str = Field(..., example="No wear and tear, drop-off available.")
    price: float = Field(..., example=50)
    dateCreated: str = Field(..., example="2024-05-23T15:30:00Z")
    imageUrl: str = Field(..., example="image URL for first Image")


class Review(BaseModel):
    listing_rating_id: str = Field(..., example="A23F29039B23")
    listing_review_id: str = Field(..., example="A523F29039B23")
    reviewerName: str = Field(..., example="John Doe")
    stars: int = Field(..., example=5)
    comment: str = Field(
        ...,
        example="Great seller, the item was exactly as described and in perfect condition.",
    )
    userID: str = Field(..., example="A23434B090934")
    listingID: str = Field(..., example="A23F29039B23")
    dateCreated: str = Field(..., example="2024-05-23T15:30:00Z")
    dateModified: str = Field(..., example="2024-05-23T15:30:00Z")


@app.get("/api/recommendations", response_model=List[ListingSummary])
async def get_recommendations(authorization: str, page: int = 1, limit: int = 20):
    # actual logic will go here

    # This is a dummy response
    return [
        {
            "listingID": "A23F29039B23",
            "sellerID": "A23F29039B23",
            "sellerName": "John Johnson",
            "title": "Used Calculus Textbook",
            "description": "No wear and tear, drop-off available.",
            "price": 50,
            "dateCreated": "2024-05-23T15:30:00Z",
            "imageUrl": "image URL for first Image",
        }
    ]


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
