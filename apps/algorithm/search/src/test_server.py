import os
from unittest.mock import AsyncMock, patch

import pytest
from elasticsearch import Elasticsearch
from fastapi.testclient import TestClient

from .server import app

TEST_INDEX = "test-index"

client = TestClient(app)

ES_ENDPOINT = os.getenv("ES_ENDPOINT")
es = Elasticsearch(
    hosts=[ES_ENDPOINT], http_auth=("elastic", os.getenv("ES_PASSWORD", ""))
)


@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown_index(monkeypatch):
    monkeypatch.setenv("ES_INDEX", TEST_INDEX)

    es.options(ignore_status=[404]).indices.delete(index=TEST_INDEX)
    es.options(ignore_status=[400]).indices.create(
        index=TEST_INDEX,
        body={
            "mappings": {
                "properties": {
                    "location": {"type": "geo_point"},
                }
            }
        },
    )

    es.indices.refresh(index=TEST_INDEX)

    yield

    es.options(ignore_status=[404]).indices.delete(index=TEST_INDEX)


@pytest.fixture(autouse=True)
def mock_insert_user_search():
    with patch("src.routes.insert_user_search", new_callable=AsyncMock) as mock:
        yield mock


@pytest.fixture(scope="function")
def auth_headers():
    return {"Cookie": "authorization=5"}


def test_search_no_listings(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "test",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}
    mock_insert_user_search.assert_awaited_once_with(5, "test")


def test_search_for_existing_listing(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": "456",
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": None,  # Example with charityId as None
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "abc123",
                "sellerID": "456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
                "charityID": None,
            }
        ],
        "totalItems": 1,
    }
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_for_multiple_listings(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": "456",
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",  # Example with charityId as a string
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "789",
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4528, "lon": -75.7060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "def456",
                "sellerID": "789",
                "sellerName": "janedoe",
                "title": "Used Laptop",
                "description": "Lightly used laptop for sale.",
                "price": 200.0,
                "dateCreated": "2024-06-01T12:00:00Z",
                "imageUrl": "https://example.com/image2.jpg",
                "charityID": None,
            },
            {
                "listingID": "abc123",
                "sellerID": "456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450.0,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
                "charityID": "12345",
            },
        ],
        "totalItems": 2,
    }
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_empty_query(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}
    mock_insert_user_search.assert_awaited_once_with(5, "")


def test_search_with_special_characters_in_query(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop!@#$%^&*()_+",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}
    mock_insert_user_search.assert_awaited_once_with(5, "laptop!@#$%^&*()_+")


def test_search_with_price_range(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": 100.00,
            "maxPrice": 500.00,
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "abc123",
                "sellerID": "456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450.0,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
                "charityID": "12345",
            }
        ],
        "totalItems": 1,
    }
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_too_low_price_range_fail(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": 100.00,
            "maxPrice": 400.00,
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_too_high_price_range_fail(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": 500.00,
            "maxPrice": 1000.00,
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_negative_min_price_fail(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": -500.00,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "minPrice cannot be negative"}
    mock_insert_user_search.assert_not_awaited()


def test_search_with_negative_max_price_fail(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "maxPrice": -500.00,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "maxPrice cannot be negative"}
    mock_insert_user_search.assert_not_awaited()


def test_search_min_price_higher_than_max_price_fail(
    auth_headers, mock_insert_user_search
):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": 500.00,
            "maxPrice": 100.00,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "minPrice cannot be greater than maxPrice"}
    mock_insert_user_search.assert_not_awaited()


def test_search_with_status(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 789,
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 40.7128, "lon": -74.0060},
            "status": "SOLD",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "status": "AVAILABLE",
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "abc123",
                "sellerID": "456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450.0,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
                "charityID": "12345",
            }
        ],
        "totalItems": 1,
    }
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_status_sold(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 789,
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "SOLD",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "status": "SOLD",
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "def456",
                "sellerID": "789",
                "sellerName": "janedoe",
                "title": "Used Laptop",
                "description": "Lightly used laptop for sale.",
                "price": 200.0,
                "dateCreated": "2024-06-01T12:00:00Z",
                "imageUrl": "https://example.com/image2.jpg",
                "charityID": None,
            }
        ],
        "totalItems": 1,
    }
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_invalid_status(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "status": "SPAGHETTI",
        },
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "enum",
                "loc": ["query", "status"],
                "msg": "Input should be 'AVAILABLE' or 'SOLD'",
                "input": "SPAGHETTI",
                "ctx": {"expected": "'AVAILABLE' or 'SOLD'"},
            }
        ]
    }
    mock_insert_user_search.assert_not_awaited()


def test_search_with_user_search(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": None,
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 789,
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "SOLD",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "billybobjoe",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "searchType": "USERS",
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "abc123",
                "sellerID": "456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450.0,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
                "charityID": None,
            }
        ],
        "totalItems": 1,
    }
    mock_insert_user_search.assert_awaited_once_with(5, "billybobjoe")


def test_search_with_user_search_negative(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 789,
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "SOLD",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "searchType": "USERS",
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_invalid_search_type(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "searchType": "INVALID",
        },
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "enum",
                "loc": ["query", "searchType"],
                "msg": "Input should be 'LISTINGS' or 'USERS'",
                "input": "INVALID",
                "ctx": {"expected": "'LISTINGS' or 'USERS'"},
            }
        ]
    }
    mock_insert_user_search.assert_not_awaited()


def test_only_return_results_within_5km_of_location(
    auth_headers, mock_insert_user_search
):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 789,
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 40.7128, "lon": -74.0060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "abc123",
                "sellerID": "456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450.00,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
                "charityID": "12345",
            }
        ],
        "totalItems": 1,
    }
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_missing_latitude(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "missing",
                "loc": ["query", "latitude"],
                "msg": "Field required",
                "input": None,
            }
        ]
    }
    mock_insert_user_search.assert_not_awaited()


def test_search_with_missing_longitude(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
        },
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "missing",
                "loc": ["query", "longitude"],
                "msg": "Field required",
                "input": None,
            }
        ]
    }
    mock_insert_user_search.assert_not_awaited()


def test_search_with_out_of_bounds_latitude(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 95.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "latitude must be between -90 and 90"}
    mock_insert_user_search.assert_not_awaited()


def test_search_with_out_of_bounds_longitude(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -195.6972,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "longitude must be between -180 and 180"}
    mock_insert_user_search.assert_not_awaited()


def test_search_with_sorting_by_relevance(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": "wally",
            "title": "Used Textbook",
            "description": "Lightly used laptop textbook for sale.",
            "price": 300.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image3.jpg"],
            "users": {"name": "wally monga"},
            "charityId": "12345",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable laptop for laptop gaming laptop and professional laptop use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": None,
        },
    )
    es.index(
        index=TEST_INDEX,
        id="ghi789",
        body={
            "listingId": "ghi789",
            "sellerId": 789,
            "title": "Used Textbook ",
            "description": "Lightly used laptop laptop laptop textbook for sale.",
            "price": 30.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": "54321",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "RELEVANCE",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert results["items"][0]["listingID"] == "def456"
    assert results["items"][1]["listingID"] == "ghi789"
    assert results["items"][2]["listingID"] == "abc123"
    assert results["totalItems"] == 3
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_sorting_by_price_asc(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 789,
            "title": "Used Textbook",
            "description": "Lightly used textbook for sale.",
            "price": 30.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "for",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["price"] == 30.00
    assert results["totalItems"] == 2
    mock_insert_user_search.assert_awaited_once_with(5, "for")


def test_search_with_sorting_by_price_desc(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 789,
            "title": "Used Textbook",
            "description": "Lightly used textbook for sale.",
            "price": 30.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "for",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "PRICE_DESC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["price"] == 450.00
    assert results["totalItems"] == 2
    mock_insert_user_search.assert_awaited_once_with(5, "for")


def test_search_with_sorting_by_listed_time_asc(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 789,
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4528, "lon": -75.7060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "LISTED_TIME_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["listingID"] == "abc123"
    assert results["items"][1]["listingID"] == "def456"
    assert results["totalItems"] == 2
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_sorting_by_listed_time_desc(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 789,
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4528, "lon": -75.7060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "LISTED_TIME_DESC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["listingID"] == "def456"
    assert results["items"][1]["listingID"] == "abc123"
    assert results["totalItems"] == 2
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_sorting_by_distance_asc(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 789,
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4528, "lon": -75.7060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "DISTANCE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["listingID"] == "abc123"
    assert results["items"][1]["listingID"] == "def456"
    assert results["totalItems"] == 2
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_sorting_by_distance_desc(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": 456,
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": "12345",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": 789,
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4528, "lon": -75.7060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "image_urls": ["https://example.com/image2.jpg"],
            "users": {"name": "janedoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "DISTANCE_DESC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["listingID"] == "def456"
    assert results["items"][1]["listingID"] == "abc123"
    assert results["totalItems"] == 2
    mock_insert_user_search.assert_awaited_once_with(5, "laptop")


def test_search_with_invalid_sorting_criteria(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "INVALID_SORT",
        },
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "enum",
                "loc": ["query", "sort"],
                "msg": "Input should be 'RELEVANCE', 'PRICE_ASC', 'PRICE_DESC', 'LISTED_TIME_ASC', "
                "'LISTED_TIME_DESC', 'DISTANCE_ASC' or 'DISTANCE_DESC'",
                "input": "INVALID_SORT",
                "ctx": {
                    "expected": "'RELEVANCE', 'PRICE_ASC', 'PRICE_DESC', 'LISTED_TIME_ASC', 'LISTED_TIME_DESC', "
                    "'DISTANCE_ASC' or 'DISTANCE_DESC'"
                },
            }
        ]
    }
    mock_insert_user_search.assert_not_awaited()


def test_search_with_pagination(auth_headers, mock_insert_user_search):
    listings = [
        {
            "listingId": f"listing{i}",
            "sellerId": f"seller{i}",
            "sellerName": f"seller_name{i}",
            "title": f"Item {i}",
            "description": f"Description of item {i}",
            "price": 100 + i,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": f"2024-06-{i + 1:02d}T12:00:00Z",
            "image_urls": [f"https://example.com/image{i}.jpg"],
            "users": {"name": f"seller_name{i}"},
            "charityId": None if i % 2 == 0 else str(i),
        }
        for i in range(15)
    ]

    for listing in listings:
        es.index(index=TEST_INDEX, id=listing["listingId"], body=listing)
    es.indices.refresh(index=TEST_INDEX)

    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 1,
            "limit": 5,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 5
    assert results["items"][0]["listingID"] == "listing0"
    assert results["items"][4]["listingID"] == "listing4"
    assert results["totalItems"] == 15

    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 2,
            "limit": 5,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 5
    assert results["items"][0]["listingID"] == "listing5"
    assert results["items"][4]["listingID"] == "listing9"
    assert results["totalItems"] == 15

    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 3,
            "limit": 5,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 5
    assert results["items"][0]["listingID"] == "listing10"
    assert results["items"][4]["listingID"] == "listing14"
    assert results["totalItems"] == 15

    # Check that insert_user_search was awaited 3 times
    assert mock_insert_user_search.await_count == 3
    mock_insert_user_search.assert_any_await(5, "Item")


def test_search_with_missing_pagination_parameters(
    auth_headers, mock_insert_user_search
):
    listings = [
        {
            "listingId": f"listing{i}",
            "sellerId": f"seller{i}",
            "sellerName": f"seller_name{i}",
            "title": f"Item {i}",
            "description": f"Description of item {i}",
            "price": 100 + i,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": f"2024-06-{i + 1:02d}T12:00:00Z",
            "image_urls": [f"https://example.com/image{i}.jpg"],
            "users": {"name": f"seller_name{i}"},
            "charityId": None if i % 2 == 0 else str(i),
        }
        for i in range(21)
    ]

    for listing in listings:
        es.index(index=TEST_INDEX, id=listing["listingId"], body=listing)
    es.indices.refresh(index=TEST_INDEX)

    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 20
    assert results["items"][0]["listingID"] == "listing0"
    assert results["items"][19]["listingID"] == "listing19"
    assert results["totalItems"] == 21
    mock_insert_user_search.assert_awaited_once_with(5, "Item")


def test_search_with_negative_page_number(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": -1,
            "limit": 5,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "page cannot be zero or negative"}
    mock_insert_user_search.assert_not_awaited()


def test_search_with_zero_page_number(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 0,
            "limit": 5,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "page cannot be zero or negative"}
    mock_insert_user_search.assert_not_awaited()


def test_search_with_negative_limit(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 1,
            "limit": -5,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "limit cannot be zero or negative"}
    mock_insert_user_search.assert_not_awaited()


def test_search_with_zero_limit(auth_headers, mock_insert_user_search):
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 1,
            "limit": 0,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "limit cannot be zero or negative"}
    mock_insert_user_search.assert_not_awaited()


def test_total_items_count_with_multiple_listings(
    auth_headers, mock_insert_user_search
):
    listings = [
        {
            "listingId": f"listing{i}",
            "sellerId": f"seller{i}",
            "sellerName": f"seller_name{i}",
            "title": f"Item {i}",
            "description": f"Description of item {i}",
            "price": 100 + i,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": f"2024-06-{i + 1:02d}T12:00:00Z",
            "image_urls": [f"https://example.com/image{i}.jpg"],
            "users": {"name": f"seller_name{i}"},
            "charityId": None if i % 2 == 0 else str(i),
        }
        for i in range(10)
    ]

    for listing in listings:
        es.index(index=TEST_INDEX, id=listing["listingId"], body=listing)
    es.indices.refresh(index=TEST_INDEX)

    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 1,
            "limit": 5,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 5
    assert results["totalItems"] == 10
    mock_insert_user_search.assert_awaited_once_with(5, "Item")


def test_total_items_count_with_filter(auth_headers, mock_insert_user_search):
    listings = [
        {
            "listingId": f"listing{i}",
            "sellerId": f"seller{i}",
            "sellerName": f"seller_name{i}",
            "title": f"Item {i}",
            "description": f"Description of item {i}",
            "price": 100 + i,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE" if i % 2 == 0 else "SOLD",
            "dateCreated": f"2024-06-{i + 1:02d}T12:00:00Z",
            "image_urls": [f"https://example.com/image{i}.jpg"],
            "users": {"name": f"seller_name{i}"},
            "charityId": None if i % 2 == 0 else str(i),
        }
        for i in range(20)
    ]

    for listing in listings:
        es.index(index=TEST_INDEX, id=listing["listingId"], body=listing)
    es.indices.refresh(index=TEST_INDEX)

    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "status": "AVAILABLE",
            "page": 1,
            "limit": 5,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 5
    assert results["totalItems"] == 10
    mock_insert_user_search.assert_awaited_once_with(5, "Item")


def test_fuzzy_search(auth_headers, mock_insert_user_search):
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": "456",
            "title": "chocolate",
            "description": "Very yummy dark chocolate.",
            "price": 8.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "image_urls": ["https://example.com/image1.jpg"],
            "users": {"name": "billybobjoe"},
            "charityId": None,
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers=auth_headers,
        params={
            "query": "chocolat",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "abc123",
                "sellerID": "456",
                "sellerName": "billybobjoe",
                "title": "chocolate",
                "description": "Very yummy dark chocolate.",
                "price": 8.00,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
                "charityID": None,
            }
        ],
        "totalItems": 1,
    }
    mock_insert_user_search.assert_awaited_once_with(5, "chocolat")
