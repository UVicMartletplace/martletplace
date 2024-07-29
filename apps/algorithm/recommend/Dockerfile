FROM python:3.12-slim AS dev

WORKDIR /app

RUN apt-get update && apt-get install -y \
    pkg-config \
    libhdf5-dev \
    gcc \
    g++ \
    curl

COPY ./requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY ./src ./src

ARG RECOMMENDER_VERSION=v2.0.1
ARG DATA_DIR=/app/training
ARG COSINE_SIMILARITY_URL=https://github.com/UVicMartletplace/martletplace/releases/download/recommender-$RECOMMENDER_VERSION/cosine_similarity_matrix.npy
ARG NORMALIZED_ITEM_VECTORS_URL=https://github.com/UVicMartletplace/martletplace/releases/download/recommender-$RECOMMENDER_VERSION/normalized_item_vectors.npy
ARG PROCESSED_DATA_URL=https://github.com/UVicMartletplace/martletplace/releases/download/recommender-$RECOMMENDER_VERSION/processed_data.csv

RUN mkdir -p "$DATA_DIR" &&\
    curl -L -o "${DATA_DIR}/cosine_similarity_matrix.npy" "$COSINE_SIMILARITY_URL" &&\
    curl -L -o "${DATA_DIR}/normalized_item_vectors.npy" "$NORMALIZED_ITEM_VECTORS_URL" &&\
    curl -L -o "${DATA_DIR}/processed_data.csv" "$PROCESSED_DATA_URL"

HEALTHCHECK CMD curl -f http://localhost:8222/.well-known/health

CMD uvicorn src.server:app --host 0.0.0.0 --port 8222 --reload

FROM dev AS prod

CMD gunicorn src.server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8222
