from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/api/recommender")
async def home(response: Response):
    return "Hello World"
