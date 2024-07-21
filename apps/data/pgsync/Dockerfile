FROM python:3.12-slim

# No way to disable status logs
ENV LOG_INTERVAL=999999
ENV CONSOLE_LOGGING_HANDLER_MIN_LEVEL=WARNING

WORKDIR /app

RUN pip install --no-cache-dir --upgrade pgsync

# Ensure the directory exists
RUN mkdir -p /app/config

# Copy the configuration file into the container
COPY schema.json /app/config/schema.json

CMD bash -c 'bootstrap --config /app/config/schema.json && pgsync --config /app/config/schema.json --daemon'
