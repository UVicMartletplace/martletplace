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
RUN mkdir -p ./src/training

ARG RECOMMENDER_VERSION=v1.0.0
ENV COSINE_SIMILARITY_URL=https://github.com/UVicMartletplace/martletplace/releases/download/recommender-$RECOMMENDER_VERSION/cosine_similarity_matrix.npy
ENV NORMALIZED_ITEM_VECTORS_URL=https://github.com/UVicMartletplace/martletplace/releases/download/recommender-$RECOMMENDER_VERSION/normalized_item_vectors.npy
ENV PROCESSED_DATA_URL=https://github.com/UVicMartletplace/martletplace/releases/download/recommender-$RECOMMENDER_VERSION/processed_data.csv

# Download the models if they don't already exist, which they will in development
# assuming we're testing new versions of the models in dev
RUN [ ! -f ./src/training/cosine_similarity_matrix.npy ] \
    && curl -L -o ./src/training/cosine_similarity_matrix.npy $COSINE_SIMILARITY_URL \
    || echo "File cosine_similarity_matrix.npy already exists"
RUN [ ! -f ./src/training/normalized_item_vectors.npy ] \
    && curl -L -o ./src/training/normalized_item_vectors.npy $NORMALIZED_ITEM_VECTORS_URL \
    || echo "File normalized_item_vectors.npy already exists"
RUN [ ! -f ./src/training/processed_data.csv ] \
    && curl -L -o ./src/training/processed_data.csv $PROCESSED_DATA_URL \
    || echo "File processed_data.csv already exists"

RUN ls -la /app/src/training/

CMD uvicorn src.server:app --host 0.0.0.0 --port 8222 --reload
