from enum import Enum


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
