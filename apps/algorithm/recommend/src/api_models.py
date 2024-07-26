from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone


class ListingSummary(BaseModel):
    listingID: str = Field(
        default=None, description="The primary key for the listing."
    )
    sellerID: Optional[str] = Field(
        ..., description="The ID of the seller, foreign key to users."
    )
    sellerName: Optional[str] = Field(..., description="The name of the seller.")
    title: str = Field(..., description="The title of the listing.")
    price: int = Field(..., description="The price of the item listed.")
    location: dict = Field(
        default={}, description="A dictionary containing location details."
    )
    description: Optional[str] = Field(
        default="No description set", description="A detailed description of the listing."
    )
    imageUrl: Optional[str] = Field(
        default=None,
        description="The URL for the first image associated with the listing.",
    )
    dateCreated: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="The UTC timestamp when the listing was created.",
    )
    charityID: Optional[str] = Field(
        default=None,
        description="The ID of the charity the item is associated with (if any).",
    )


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
