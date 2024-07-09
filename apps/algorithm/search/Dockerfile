FROM python:3.12-slim

WORKDIR /app

RUN apt update && apt install -y curl

COPY ./requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY ./src ./src

HEALTHCHECK CMD curl -f http://localhost:8221/.well-known/health

CMD uvicorn src.server:app --host 0.0.0.0 --port 8221 --reload
