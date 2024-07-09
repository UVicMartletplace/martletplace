FROM python:3.12-slim

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

ARG RECOMMENDER_VERSION=v1.0.0
ENV COSINE_SIMILARITY_URL=https://github.com/UVicMartletplace/martletplace/releases/download/recommender-$RECOMMENDER_VERSION/cosine_similarity_matrix.npy
ENV NORMALIZED_ITEM_VECTORS_URL=https://github.com/UVicMartletplace/martletplace/releases/download/recommender-$RECOMMENDER_VERSION/normalized_item_vectors.npy
ENV PROCESSED_DATA_URL=https://github.com/UVicMartletplace/martletplace/releases/download/recommender-$RECOMMENDER_VERSION/processed_data.csv

HEALTHCHECK CMD curl -f http://localhost:8222/.well-known/health

CMD uvicorn src.server:app --host 0.0.0.0 --port 8222 --reload
