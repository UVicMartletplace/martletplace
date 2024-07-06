import pytest
from fastapi.testclient import TestClient
from src.server import app

client = TestClient(app)


@pytest.fixture(scope="function")
def auth_headers():
    return {"Cookie": "authorization=1"}


def test_get_recommendations(auth_headers):
    response = client.get(
        "/api/recommendations?authorization=1",
        headers=auth_headers,
        params={"page": 1, "limit": 10},
    )
    assert response.status_code == 200
    assert len(response.json()) == 10
