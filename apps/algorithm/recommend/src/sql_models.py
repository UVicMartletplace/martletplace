from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import ARRAY, JSON, Column, String
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List


class StatusType(str, Enum):
    available = "AVAILABLE"
    sold = "SOLD"
    removed = "REMOVED"


class Users(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(nullable=False, unique=True)
    email: str = Field(nullable=False, unique=True)
    password: str
    name: Optional[str] = None
    bio: Optional[str] = None
    profile_pic_url: Optional[str] = None
    verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    modified_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    listings: List["Listings"] = Relationship(back_populates="seller")
    searches: List["User_Searches"] = Relationship(back_populates="user")
    clicks: List["User_Clicks"] = Relationship(back_populates="user")


class Listings(SQLModel, table=True):
    listing_id: Optional[int] = Field(default=None, primary_key=True)
    seller_id: int = Field(foreign_key="users.user_id")
    buyer_id: Optional[int] = None
    title: str
    price: int
    location: dict = Field(sa_column=Column(JSON), default={})
    status: StatusType
    description: Optional[str] = None
    image_urls: List[str] = Field(sa_column=Column(ARRAY(String)), default=[])
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    modified_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    seller: Users = Relationship(back_populates="listings")


class User_Searches(SQLModel, table=True):
    search_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.user_id")
    search_term: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Users = Relationship(back_populates="searches")


class User_Clicks(SQLModel, table=True):
    click_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.user_id")
    listing_id: int = Field(foreign_key="listings.listing_id")
    click_timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    user: Users = Relationship(back_populates="clicks")
