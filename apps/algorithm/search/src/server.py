from enum import Enum
from typing import List, Optional
import requests
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field
# from pydantic_partial import create_partial_model

app = FastAPI()

elasticsearch_auth = ('elastic', 'serxdfcghjfc')

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


# Define Pydantic models
class ListingSummary(BaseModel):
    listingID: str = Field(..., example="A23F29039B23")
    sellerID: str = Field(..., example="A23F29039B23")
    sellerName: str = Field(..., example="John Doe")
    title: str = Field(..., example="Used Calculus Textbook")
    description: str = Field(..., example="No wear and tear, drop-off available.")
    price: float = Field(..., example=50)
    dateCreated: str = Field(..., example="2024-05-23T15:30:00Z")
    imageUrl: str = Field(..., example="image URL for first Image")


class Listing(BaseModel):
    listingId: str = Field(..., example="abc123")
    sellerId: str = Field(..., example="seller456")
    sellerName: str = Field(..., example="billybobjoe")
    title: str = Field(..., example="High-Performance Laptop")
    description: str = Field(
        ..., example="A powerful laptop suitable for gaming " "and professional use."
    )
    price: float = Field(..., example=450.00)
    location: dict = Field(..., example={"latitude": 45.4215, "longitude": -75.6972})
    status: str = Field(..., example="AVAILABLE")
    dateCreated: str = Field(..., example="2024-05-22T10:30:00Z")
    imageUrl: str = Field(..., example="https://example.com/image1.jpg")


class PartialListing(BaseModel):
    listingId: Optional[str] = Field(..., example="abc123")
    sellerId: Optional[str] = Field(..., example="seller456")
    sellerName: Optional[str] = Field(..., example="billybobjoe")
    title: Optional[str] = Field(..., example="High-Performance Laptop")
    description: Optional[str] = Field(
        ..., example="A powerful laptop suitable for gaming " "and professional use."
    )
    price: Optional[float] = Field(..., example=450.00)
    location: Optional[dict] = Field(..., example={"latitude": 45.4215, "longitude": -75.6972})
    status: Optional[str] = Field(..., example="AVAILABLE")
    dateCreated: Optional[str] = Field(..., example="2024-05-22T10:30:00Z")
    imageUrl: Optional[str] = Field(..., example="https://example.com/image1.jpg")


# PartialListing = create_partial_model(Listing)


@app.get("/api/search", response_model=List[ListingSummary])
async def search(
    authorization: str,
    query: str,
    latitude: float,
    longitude: float,
    page: int = 1,
    limit: int = 20,
    minPrice: float = None,
    maxPrice: float = None,
    status: str = "AVAILABLE",
    searchType: str = "LISTINGS",
    sort: str = "RELEVANCE",
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
            "imageUrl": "image URL for first Image",
        },
        {
            "listingID": "A23F29039B24",
            "sellerID": "A23F29039B24",
            "sellerName": "Jane Doe",
            "title": "Used Physics Textbook",
            "description": "No wear and tear, drop-off available.",
            "price": 40,
            "dateCreated": "2024-05-23T15:30:00Z",
            "imageUrl": "image URL for first Image",
        },
    ]

@app.get("/api/listing/{listing_id}")
async def get_listing(listing_id: str):
    # Return the listing object.
    listing = requests.get(
        f'https://elasticsearch:8311/listing/_doc/{listing_id}',
        auth=elasticsearch_auth,
        verify=False).json()

    # Return the listing.
    return {
        'listing': listing['_source']
    }


@app.put("/api/listing/{listing_id}")
async def put_listing(listing_id: str, listing: Listing):
    # Create a new document or replace an existing document in the search engine.
    requests.post(
        f'https://elasticsearch:8311/listing/_doc/{listing_id}',
        json=jsonable_encoder(listing),
        auth=elasticsearch_auth,
        verify=False)

    # Nothing to return.
    return None


@app.patch("/api/listing/{listing_id}")
async def patch_listing(listing_id: str, listing: PartialListing):
    # print(f'*** PATCH /api/listing/{listing_id}')
    # print('listing = ', jsonable_encoder(listing))

    # Modify a subset of fields in an existing document in the search engine.
    requests.post(
        f'https://elasticsearch:8311/listing/_update/{listing_id}',
        # json=jsonable_encoder(listing),
        json={
            'doc': jsonable_encoder(listing),
            'detect_noop': False
        },
        auth=elasticsearch_auth,
        verify=False)

    # Nothing to return.
    return None


@app.delete("/api/listing/{listing_id}")
async def delete_listing(listing_id: str):
    # Delete the existing document from the search engine.

    return {"message": "Deleted the listing"}
