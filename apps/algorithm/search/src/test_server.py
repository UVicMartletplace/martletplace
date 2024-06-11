from fastapi.testclient import TestClient
from apps.algorithm.search.src.server import app

client = TestClient(app)


def test_search_listings():
    response = client.get("/api/search", params={
        "authorization": "Bearer testtoken",
        "query": "test",
        "latitude": 45.4315,
        "longitude": -75.6972
    })
    assert response.status_code == 500
    assert response.json() == []  # No listings found
