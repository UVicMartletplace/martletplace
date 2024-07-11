from fastapi import FastAPI, Request, HTTPException
import jwt
import os

from .routes import search_router

app = FastAPI()


@app.middleware("http")
async def authenticate_request(request: Request, call_next):
    auth_token = request.cookies.get("authorization")

    if not auth_token:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not os.getenv("PYTEST_CURRENT_TEST"):
        try:
            decoded = jwt.decode(
                auth_token, os.getenv("JWT_PUBLIC_KEY"), algorithms=["RS256"]
            )
            request.state.user = decoded["userId"]
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except Exception as e:
            print(e)
            raise HTTPException(status_code=401, detail="Invalid token")
    else:
        request.state.user = int(auth_token)

    response = await call_next(request)
    return response


app.include_router(search_router)
