from pydantic import BaseModel, Field, ConfigDict

from .enums import Status


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


class Location(BaseModel):
    lat: float = Field(..., description="Latitude of the location", ge=-90, le=90)
    lon: float = Field(..., description="Longitude of the location", ge=-180, le=180)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "lat": 45.4215,
                "lon": -75.6972,
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
    location: Location = Field(...)
    status: Status = Field(...)
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
                "location": {"lat": 45.4215, "lon": -75.6972},
                "status": "AVAILABLE",
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
            }
        }
    )
