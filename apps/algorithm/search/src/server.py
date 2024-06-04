from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from fastapi import FastAPI

app = FastAPI()

# define enums
class Status(str, Enum):
    AVAILABLE = "AVAILABLE"
    SOLD = "SOLD"

class SearchType(str, Enum):
    LISTINGS = "LISTINGS"
    SELLERS = "SELLERS"

class Sort(str, Enum):
    RELEVANCE = "RELEVANCE"
    PRICE_ASC = "PRICE_ASC"
    PRICE_DESC = "PRICE_DESC"
    LISTED_TIME_ASC = "LISTED_TIME_ASC"
    LISTED_TIME_DESC = "LISTED_TIME_DESC"
    DISTANCE_ASC = "DISTANCE_ASC"
    DISTANCE_DESC = "DISTANCE_DESC"

# Define Pydantic model
class ListingSummary(BaseModel):
    listingID: str = Field(..., example="A23F29039B23")
    sellerID: str = Field(..., example="A23F29039B23")
    sellerName: str = Field(..., example="John Doe")
    title: str = Field(..., example="Used Calculus Textbook")
    description: str = Field(...,
                             example="No wear and tear, drop-off available.")
    price: float = Field(..., example=50)
    dateCreated: str = Field(..., example="2024-05-23T15:30:00Z")
    imageUrl: str = Field(..., example="image URL for first Image")

@app.get("/api/search", response_model=List[ListingSummary])
async def search(
    authorization: str, query: str, latitude: float,
    longitude: float, page: int, limit: int,
    minPrice: float = None, maxPrice: float = None,
    status: str = "AVAILABLE", searchType: str = "LISTINGS",
    sort: str = "RELEVANCE"
):
    # actual logic will go here

    # This is a dummy response
    return [
        {
            "listingID": "A23F29039B23",
            "sellerID": "A23F29039B23",
            "sellerName": "John Doe",
            "title": "Used Calculus Textbook",
            "description": "No wear and tear, drop-off available.",
            "price": 50,
            "dateCreated": "2024-05-23T15:30:00Z",
            "imageUrl": "image URL for first Image"
        },
        {
            "listingID": "A23F29039B24",
            "sellerID": "A23F29039B24",
            "sellerName": "Jane Doe",
            "title": "Used Physics Textbook",
            "description": "No wear and tear, drop-off available.",
            "price": 40,
            "dateCreated": "2024-05-23T15:30:00Z",
            "imageUrl": "image URL for first Image"
        }
    ]
