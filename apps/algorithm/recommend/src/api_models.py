from pydantic import BaseModel, Field


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
