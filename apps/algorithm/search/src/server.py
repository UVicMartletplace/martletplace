from fastapi import FastAPI, Response

app = FastAPI()


@app.get("/api/search")
async def home(response: Response):
    return "Hello World"
