FROM otel/opentelemetry-collector-contrib:0.104.0

COPY config.yaml /etc/otelcol-contrib/config.yaml

# This healtcheck keeps failing even thought the endpoints is up?
# HEALTHCHECK CMD curl -f http://0.0.0.0:13133/.well-known/health
