from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/api/recommend")
async def home(response: Response):
    return "Hello World"
