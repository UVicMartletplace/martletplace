FROM python:3.12-slim

# No way to disable status logs
ENV LOG_INTERVAL=999999
ENV CONSOLE_LOGGING_HANDLER_MIN_LEVEL=WARNING
ENV REDIS_HOST=localhost
ENV REDIS_DB=0

WORKDIR /app

ADD https://github.com/dragonflydb/dragonfly/releases/download/v1.20.1/dragonfly_amd64.deb dragonfly_amd64.deb 
RUN apt update && apt install -y supervisor ./dragonfly_amd64.deb --no-install-recommends && apt clean && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir --upgrade pgsync

COPY supervisord.conf /etc/supervisord.conf
COPY schema.json /app/config/schema.json

ENTRYPOINT ["/bin/sh", "-c", "supervisord"]
