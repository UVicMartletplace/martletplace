import os
import pytest

from elasticsearch import Elasticsearch
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

es_endpoint = os.getenv("ES_ENDPOINT")
es = Elasticsearch([es_endpoint], verify_certs=False)


@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown_index(monkeypatch):
    index_name = "test-index"

    # Set the environment variable for the index name
    monkeypatch.setenv("ES_INDEX", index_name)

    es.indices.create(index=index_name, ignore=400)

    es.index(index=index_name, id="abc123", body={
        "listingId": "abc123",
        "sellerId": "seller456",
        "sellerName": "billybobjoe",
        "title": "High-Performance Laptop",
        "description": "A powerful laptop suitable for gaming and professional use.",
        "price": 450.00,
        "location": {"latitude": 45.4215, "longitude": -75.6972},
        "status": "AVAILABLE",
        "dateCreated": "2024-05-22T10:30:00Z",
        "imageUrl": "https://example.com/image1.jpg"
    })
    es.index(index=index_name, id="def456", body={
        "listingId": "def456",
        "sellerId": "seller789",
        "sellerName": "janedoe",
        "title": "Used Textbook",
        "description": "Lightly used textbook for sale.",
        "price": 30.00,
        "location": {"latitude": 40.7128, "longitude": -74.0060},
        "status": "AVAILABLE",
        "dateCreated": "2024-06-01T12:00:00Z",
        "imageUrl": "https://example.com/image2.jpg"
    })
    es.indices.refresh(index=index_name)

    yield

    es.indices.delete(index=index_name, ignore=[400, 404])


def test_search_listings():
    response = client.get(
        "/api/search",
        params={
            "authorization": "Bearer testtoken",
            "query": "test",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == []
