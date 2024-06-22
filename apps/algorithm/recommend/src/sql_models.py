from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class StatusType(str, Enum):
    available = "AVAILABLE"
    sold = "SOLD"
    removed = "REMOVED"

class LocationType(SQLModel):
    latitude: float
    longitude: float

class User(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(nullable=False, unique=True)
    email: str = Field(nullable=False, unique=True)
    password: str
    name: Optional[str] = None
    bio: Optional[str] = None
    profile_pic_url: Optional[str] = None
    verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now(datetime.UTC))
    modified_at: datetime = Field(default_factory=datetime.now(datetime.UTC))
    listings: List["Listing"] = Relationship(back_populates="seller")

class Listing(SQLModel, table=True):
    listing_id: Optional[int] = Field(default=None, primary_key=True)
    seller_id: int = Field(foreign_key="user.user_id")
    buyer_id: Optional[int] = Field(default=None, foreign_key="user.user_id")
    title: str
    price: int
    location: LocationType
    status: StatusType
    description: Optional[str] = None
    image_urls: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now(datetime.UTC))
    modified_at: datetime = Field(default_factory=datetime.now(datetime.UTC))
    seller: User = Relationship(back_populates="listings")