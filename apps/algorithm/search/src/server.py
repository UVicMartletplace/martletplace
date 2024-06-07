import os
from enum import Enum
from typing import List, Dict, Any

from elasticsearch import Elasticsearch
from elasticsearch.exceptions import NotFoundError
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

# Elasticsearch client
es_endpoint = os.getenv("ES_ENDPOINT")
es = Elasticsearch(
    [es_endpoint],
    verify_certs=False
)


# define enums
class Status(str, Enum):
    AVAILABLE = "AVAILABLE"
    SOLD = "SOLD"


class SearchType(str, Enum):
    LISTINGS = "LISTINGS"
    USERS = "USERS"


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
    try:
        sort_options = {
            "RELEVANCE": "_score",
            "PRICE_ASC": "price:asc",
            "PRICE_DESC": "price:desc",
            "LISTED_TIME_ASC": "dateCreated:asc",
            "LISTED_TIME_DESC": "dateCreated:desc",
            "DISTANCE_ASC": "_geo_distance",
            "DISTANCE_DESC": "_geo_distance"
        }

        # Construct the search body based on the searchType
        if searchType == "LISTINGS":
            must_conditions = [
                {"multi_match": {"query": query, "fields": ["title", "description"]}},
                {"match": {"status": status}}
            ]
        elif searchType == "USERS":
            must_conditions = [{"match": {"sellerName": query}}]
        else:
            raise HTTPException(status_code=400, detail="Invalid searchType")

        search_body: Dict[str, Any] = {
            "from": (page - 1) * limit,
            "size": limit,
            "query": {
                "bool": {
                    "must": must_conditions,
                    "filter": []
                }
            },
            "sort": [
                {sort_options[sort]: {"order": "asc" if "ASC" in sort else "desc"}}
            ]
        }

        if minPrice is not None or maxPrice is not None:
            price_range = {}
            if minPrice is not None:
                price_range["gte"] = minPrice
            if maxPrice is not None:
                price_range["lte"] = maxPrice
            search_body["query"]["bool"]["filter"].append({"range": {"price": price_range}})

        if "DISTANCE" in sort:
            search_body["sort"] = [
                {
                    "_geo_distance": {
                        "location": {"lat": latitude, "lon": longitude},
                        "order": "asc" if sort == "DISTANCE_ASC" else "desc",
                        "unit": "km"
                    }
                }
            ]

        response = es.search(index="my-new-index", body=search_body)

        results = [
            {
                "listingID": hit["_source"]["listingId"],
                "sellerID": hit["_source"]["sellerId"],
                "sellerName": hit["_source"]["sellerName"],
                "title": hit["_source"]["title"],
                "description": hit["_source"]["description"],
                "price": hit["_source"]["price"],
                "dateCreated": hit["_source"]["dateCreated"],
                "imageUrl": hit["_source"]["imageUrl"],
            }
            for hit in response["hits"]["hits"]
        ]

        return results

    except NotFoundError:
        raise HTTPException(status_code=404, detail="Index not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search/reindex/listing-created")
async def reindex_listing_created(authorization: str, listing: Listing):
    # actual logic will go here

    return {"message": "Listing added successfully."}


@app.patch("/api/search/reindex/listing-edited")
async def reindex_listing_edited(authorization: str, listing: Listing):
    # actual logic will go here

    return {"message": "Listing edited successfully."}


@app.delete("/api/search/reindex/listing-deleted")
async def reindex_listing_deleted(authorization: str, listingId: str):
    # actual logic will go here

    return {"message": "Listing deleted successfully."}
