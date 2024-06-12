import os
from enum import Enum
from typing import List, Dict, Any

from elasticsearch import Elasticsearch
from elasticsearch.exceptions import NotFoundError
from fastapi import FastAPI, HTTPException
from pydantic import ConfigDict, BaseModel, Field

app = FastAPI()

es_endpoint = os.getenv("ES_ENDPOINT")
es = Elasticsearch([es_endpoint], verify_certs=False)


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


class ListingSummary(BaseModel):
    listingID: str = Field(...)
    sellerID: str = Field(...)
    sellerName: str = Field(...)
    title: str = Field(...)
    description: str = Field(...)
    price: float = Field(...)
    dateCreated: str = Field(...)
    imageUrl: str = Field(...)
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "listingID": "A23F29039B23",
                "sellerID": "A23F29039B23",
                "sellerName": "John Doe",
                "title": "Used Calculus Textbook",
                "description": "No wear and tear, drop-off available.",
                "price": 50,
                "dateCreated": "2024-05-23T15:30:00Z",
                "imageUrl": "image URL for first Image",
            }
        }
    )


class Listing(BaseModel):
    listingId: str = Field(...)
    sellerId: str = Field(...)
    sellerName: str = Field(...)
    title: str = Field(...)
    description: str = Field(...)
    price: float = Field(...)
    location: dict = Field(...)
    status: str = Field(...)
    dateCreated: str = Field(...)
    imageUrl: str = Field(...)
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "listingId": "abc123",
                "sellerId": "seller456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450.00,
                "location": {"latitude": 45.4215, "longitude": -75.6972},
                "status": "AVAILABLE",
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
            }
        }
    )


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
    status: Status = "AVAILABLE",
    searchType: SearchType = "LISTINGS",
    sort: Sort = "RELEVANCE",
):
    try:
        INDEX = os.getenv("ES_INDEX", "index")

        sort_options = {
            "RELEVANCE": "_score",
            "PRICE_ASC": "price",
            "PRICE_DESC": "price",
            "LISTED_TIME_ASC": "dateCreated",
            "LISTED_TIME_DESC": "dateCreated",
            "DISTANCE_ASC": "_geo_distance",
            "DISTANCE_DESC": "_geo_distance",
        }

        if searchType == "LISTINGS":
            must_conditions = [
                {"multi_match": {"query": query, "fields": ["title", "description"]}},
                {"match": {"status": status}},
            ]
        elif searchType == "USERS":
            must_conditions = [{"match": {"sellerName": query}}]
        else:
            raise HTTPException(status_code=400, detail="Invalid searchType")

        search_body: Dict[str, Any] = {
            "from": (page - 1) * limit,
            "size": limit,
            "query": {"bool": {"must": must_conditions, "filter": []}},
            "sort": [],
        }

        if minPrice is not None or maxPrice is not None:
            price_range = {}
            if minPrice is not None:
                price_range["gte"] = minPrice
            if maxPrice is not None:
                price_range["lte"] = maxPrice
            search_body["query"]["bool"]["filter"].append(
                {"range": {"price": price_range}}
            )

        if "DISTANCE" in sort:
            search_body["sort"].append(
                {
                    "_geo_distance": {
                        "location": {"lat": latitude, "lon": longitude},
                        "order": "asc" if sort == "DISTANCE_ASC" else "desc",
                        "unit": "km",
                    }
                }
            )
        else:
            search_body["sort"].append(
                {sort_options[sort]: {"order": "asc" if "ASC" in sort else "desc"}}
            )

        response = es.search(index=INDEX, body=search_body)

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
