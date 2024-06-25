from fastapi import HTTPException


def validate_search_params(
    latitude: float,
    longitude: float,
    page: int,
    limit: int,
    minPrice: float,
    maxPrice: float,
):
    if abs(latitude) > 90:
        raise HTTPException(
            status_code=422, detail="latitude must be between -90 and 90"
        )
    if abs(longitude) > 180:
        raise HTTPException(
            status_code=422, detail="longitude must be between -180 and 180"
        )
    if page <= 0:
        raise HTTPException(status_code=422, detail="page cannot be zero or negative")
    if limit <= 0:
        raise HTTPException(status_code=422, detail="limit cannot be zero or negative")
    if minPrice is not None and minPrice < 0:
        raise HTTPException(status_code=422, detail="minPrice cannot be negative")
    if maxPrice is not None and maxPrice < 0:
        raise HTTPException(status_code=422, detail="maxPrice cannot be negative")
    if minPrice is not None and maxPrice is not None and minPrice > maxPrice:
        raise HTTPException(
            status_code=422, detail="minPrice cannot be greater than maxPrice"
        )
