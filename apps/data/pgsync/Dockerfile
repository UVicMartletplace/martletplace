FROM python:3.12-slim

WORKDIR /app

COPY ./requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the configuration file into the container
COPY config/pgsync.yml /app/config/pgsync.yml

# Entry point for PGSync
ENTRYPOINT ["python", "pgsync.py"]
