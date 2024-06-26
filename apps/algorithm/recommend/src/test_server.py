from fastapi.testclient import TestClient
from src.server import app

client = TestClient(app)


def test_get_recommendations():
    response = client.get(
        "/api/recommendations",
        headers={"authorization": "1"},
        params={"page": 1, "limit": 10},
    )
    assert response.status_code == 200
    assert len(response.json()) == 10


# def test_get_recommendations_invalid_user():
#     response = client.get(
#         "/api/recommendations",
#         headers={"authorization": "abc"},
#         params={"page": 1, "limit": 10},
#     )
#     assert response.status_code == 404
#     assert response.json() == {"detail": "User not found: abc"}


# def test_get_recommendations_no_recommendations():
#     response = client.get(
#         "/api/recommendations",
#         headers={"authorization": "2"},
#         params={"page": 1, "limit": 0},
#     )
#     assert response.status_code == 200
#     assert response.json() == []
