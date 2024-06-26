from fastapi.testclient import TestClient
from src.server import app

client = TestClient(app)


def test_get_recommendations():
    response = client.get(
        "/api/recommendations?authorization=1",
        headers={"authorization": "1"},
        params={"page": 1, "limit": 10},
    )
    assert response.status_code == 200
    assert len(response.json()) == 10


