FROM python:3.12-slim

WORKDIR /app

COPY ./requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY ./src ./src

CMD uvicorn src.server:app --host 0.0.0.0 --port 8221 --reload
