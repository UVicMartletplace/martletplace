from fastapi import FastAPI

app = FastAPI()


@app.get("/api/search")
async def search(authorization: str, query: str, latitude: float,
                 longitude: float, page: int,
                 limit: int, minPrice: float = None,
                 maxPrice: float = None, status: str = "AVAILABLE",
                 searchType: str = "LISTINGS", sort: str = "RELEVANCE"
                 ):
    # actual logic will go here

    # This is a dummy response
    return [
        {
            "listingID": "A23F29039B23",
            "sellerID": "A23F29039B23",
            "sellerName": "John Doe",
            "title": "Used Calculus Textbook",
            "description": "No wear and tear, drop-off available.",
            "price": 50,
            "dateCreated": "2024-05-23T15:30:00Z",
            "imageUrl": "image URL for first Image"
        },
        {
            "listingID": "A23F29039B24",
            "sellerID": "A23F29039B24",
            "sellerName": "Jane Doe",
            "title": "Used Physics Textbook",
            "description": "No wear and tear, drop-off available.",
            "price": 40,
            "dateCreated": "2024-05-23T15:30:00Z",
            "imageUrl": "image URL for first Image"
        }
    ]
