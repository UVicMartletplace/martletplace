import os
from typing import Dict, Any

from elasticsearch import Elasticsearch, NotFoundError
from fastapi import APIRouter, HTTPException, Request, Response, BackgroundTasks

from .config import DEFAULT_INDEX, ES_ENDPOINT, DISTANCE_TO_SEARCH_WITHIN
from .database import insert_user_search
from .enums import Status, SearchType, Sort
from .validation import validate_search_params

from opentelemetry.instrumentation.requests import RequestsInstrumentor

RequestsInstrumentor().instrument()

search_router = APIRouter()

es = Elasticsearch([ES_ENDPOINT], verify_certs=False)


@search_router.get("/api/search")
async def search(
    request: Request,
    background_tasks: BackgroundTasks,
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
    validate_search_params(latitude, longitude, page, limit, minPrice, maxPrice)

    INDEX = os.getenv("ES_INDEX", DEFAULT_INDEX)

    if searchType == "LISTINGS":
        must_conditions = [
            {
                "multi_match": {
                    "query": query,
                    "fields": ["title", "description"],
                    "fuzziness": "AUTO",
                }
            },
            {"match": {"status": status}},
        ]
    elif searchType == "USERS":
        must_conditions = [
            {"match": {"users.name": query}},
            {"match": {"status": status}},
        ]
    else:
        raise HTTPException(status_code=422, detail="Invalid searchType")

    search_body: Dict[str, Any] = {
        "from": (page - 1) * limit,
        "size": limit,
        "query": {
            "bool": {
                "must": must_conditions,
                "filter": [
                    {
                        "geo_distance": {
                            "distance": DISTANCE_TO_SEARCH_WITHIN,
                            "location": {"lat": latitude, "lon": longitude},
                        }
                    }
                ],
            },
        },
        "sort": [],
    }

    if minPrice is not None or maxPrice is not None:
        price_range = {}
        if minPrice is not None:
            price_range["gte"] = minPrice
        if maxPrice is not None:
            price_range["lte"] = maxPrice
        search_body["query"]["bool"]["filter"].append({"range": {"price": price_range}})

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
        sort_options = {
            "RELEVANCE": "_score",
            "PRICE_ASC": "price",
            "PRICE_DESC": "price",
            "LISTED_TIME_ASC": "dateCreated",
            "LISTED_TIME_DESC": "dateCreated",
            "DISTANCE_ASC": "_geo_distance",
            "DISTANCE_DESC": "_geo_distance",
        }
        search_body["sort"].append(
            {sort_options[sort]: {"order": "asc" if "ASC" in sort else "desc"}}
        )

    try:
        response = es.search(index=INDEX, body=search_body)
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Index not found")

    total_items = response["hits"]["total"]["value"]
    results = [
        {
            "listingID": str(hit["_source"]["listingId"]),
            "sellerID": str(hit["_source"]["sellerId"]),
            "sellerName": hit["_source"]["users"]["name"],
            "title": hit["_source"]["title"],
            "description": hit["_source"]["description"],
            "price": hit["_source"]["price"],
            "dateCreated": hit["_source"]["dateCreated"],
            "imageUrl": hit["_source"]["image_urls"][0]
            if hit["_source"]["image_urls"]
            else None,
        }
        for hit in response["hits"]["hits"]
    ]

    background_tasks.add_task(insert_user_search, request.state.user, query)
    return {"items": results, "totalItems": total_items}


@search_router.get("/.well-known/health")
async def health():
    return Response(status_code=200)
