# ruff: noqa: E402
import ast
from typing import List
from fastapi import FastAPI, HTTPException, Depends, Request, Response
import pandas as pd
import jwt
import os

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

app = FastAPI()


def otel_trace_init(app, name):
    trace.set_tracer_provider(
        TracerProvider(
            resource=Resource.create({"service.name": name}),
        ),
    )
    otlp_span_exporter = OTLPSpanExporter(endpoint=os.getenv("OTEL_COLLECTOR_ENDPOINT"))
    trace.get_tracer_provider().add_span_processor(
        BatchSpanProcessor(otlp_span_exporter)
    )
    FastAPIInstrumentor.instrument_app(app)
    return app


app = otel_trace_init(app, "recommend")

SQLAlchemyInstrumentor().instrument()

from sqlalchemy import text
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.sql_models import User_Preferences, Users, User_Clicks, User_Searches, Listings
from src.api_models import ListingSummary
from src.db import get_session
from src.recommender import Recommender

recommender = Recommender()


@app.middleware("http")
async def authenticate_request(request: Request, call_next):
    # Allow the healthcheck to pass auth
    if request.url.path == "/.well-known/health":
        response = await call_next(request)
        return response

    auth_token = request.cookies.get("authorization")

    if not auth_token:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not os.getenv("PYTEST_CURRENT_TEST"):
        try:
            decoded = jwt.decode(
                auth_token, os.getenv("JWT_PUBLIC_KEY"), algorithms=["RS256"]
            )
            request.state.user = decoded["userId"]
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except Exception as e:
            print(e)
            raise HTTPException(status_code=401, detail="Invalid token")
    else:
        request.state.user = int(auth_token)

    response = await call_next(request)
    return response


@app.get("/api/recommendations", response_model=List[ListingSummary])
async def get_recommendations(
    req: Request,
    page: int = 1,
    limit: int = 20,
    session: AsyncSession = Depends(get_session),
):
    user_id = req.state.user
    users = await session.exec(select(Users).where(Users.user_id == user_id))
    user = users.first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found: " + str(user_id))

    items_clicked = await session.exec(
        select(User_Clicks).where(User_Clicks.user_id == user_id)
    )
    items_clicked = [item.click_term for item in items_clicked]

    terms_searched = await session.exec(
        select(User_Searches).where(User_Searches.user_id == user_id)
    )
    terms_searched = [term.search_term for term in terms_searched]

    items_disliked = await session.exec(
        select(User_Preferences).where(User_Preferences.user_id == user_id)
    )
    items_disliked = [item.listing_id for item in items_disliked]

    recommended_listings = recommender.recommend(
        items_clicked, terms_searched, items_disliked, page, limit
    )
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
    if recommended_listings.size == 0:
        query = (
            select(Listings, Users.name.label("seller_name"))
            .join(Users, Listings.seller_id == Users.user_id)
            .limit(limit)
        )
        result = await session.exec(query)
        recommended_listings = result.fetchall()
        listings_formatted = []
        for row in recommended_listings:
            try:
                img_url = str(row[0].image_urls[0])
            except (ValueError, SyntaxError):
                img_url = None
            listing_summary = ListingSummary(
                listingID=str(row[0].listing_id),
                sellerID=str(row[0].seller_id),
                sellerName=str(row[1]),
                title=str(row[0].title),
                price=(row[0].price),
                description=row[0].description,
                imageUrl=img_url,
                dateCreated=row[0].created_at,
                modified_at=row[0].modified_at,
            )
            listings_formatted.append(listing_summary)
        return listings_formatted
    # replace rows with NaN values with 0s
    recommended_listings = recommended_listings.fillna(0)

    recommended_listings = pd.DataFrame(recommended_listings, columns=columns)

    seller_ids = recommended_listings["seller_id"].tolist()
    seller_names_query = select(Users.user_id, Users.name).where(
        Users.user_id.in_(seller_ids)
    )

    seller_names_result = await session.exec(seller_names_query)
    seller_names = seller_names_result.fetchall()

    seller_name_dict = {}
    for user_id, name in seller_names:
        if user_id not in seller_name_dict:
            seller_name_dict[user_id] = name

    listing_summaries = []
    for _, row in recommended_listings.iterrows():
        # this is so cursed, but since image urls are stored as a string of a python list, we gotta do this
        try:
            img_urls = ast.literal_eval(row["image_urls"])
        except (ValueError, SyntaxError):
            img_urls = []
        listing_summary = ListingSummary(
            listingID=str(row["listing_id"]),
            sellerID=str(row["seller_id"]),
            sellerName=str(seller_name_dict[row["seller_id"]]),
            title=str(row["title"]),
            price=row["price"],
            description=str(row["description"]),
            dateCreated=row["created_at"],
        )
        if len(img_urls) > 0:
            listing_summary.imageUrl = str(img_urls[0])
        listing_summaries.append(listing_summary)
    await session.close()
    return listing_summaries


@app.post("/api/recommendations/stop/{id}")
async def stop_suggesting_item(
    req: Request,
    id: int,
    session: AsyncSession = Depends(get_session),
):
    user_id = req.state.user
    users = await session.exec(select(Users).where(Users.user_id == user_id))
    user = users.first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found: " + str(user_id))

    await session.execute(
        text(
            "INSERT INTO user_preferences (user_id, listing_id, weight) VALUES (:user_id, :listing_id, :weight)"
        ),
        {"user_id": user_id, "listing_id": id, "weight": -1.0},
    )
    await session.commit()
    await session.close()

    return {"message": "Preference updated successfully."}


@app.get("/.well-known/health")
async def health():
    return Response(status_code=200)
