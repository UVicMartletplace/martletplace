FROM rust:1.78-slim AS build

RUN mkdir /build
WORKDIR /build

COPY Cargo.toml /build/Cargo.toml
COPY src /build/src

RUN cargo build --release

FROM bitnami/pgbouncer:1.22.1

USER root

ENV PGBOUNCER_PORT=8300
ENV PGBOUNCER_DATABASE=martletplace
ENV PGBOUNCER_LOG_STATS=0

RUN apt update && apt install -y supervisor

COPY supervisord.conf /etc/supervisord.conf

COPY --from=build /build/target/release/datalayer /datalayer

ENTRYPOINT ["/bin/sh", "-c", "supervisord"]
