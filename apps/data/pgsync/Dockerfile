FROM python:3.12-slim

WORKDIR /app

COPY ./requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Ensure the directory exists
RUN mkdir -p /app/config

# Copy the configuration file into the container
COPY pgsync.yml /app/config/pgsync.yml

CMD ["pgsync", "--config", "/app/config/pgsync.yml"]
