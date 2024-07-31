FROM lukemathwalker/cargo-chef:latest AS chef
WORKDIR /build

FROM chef AS planner
COPY ./Cargo.toml ./Cargo.lock ./
COPY ./src ./src
RUN cargo chef prepare

FROM chef AS builder
COPY --from=planner /build/recipe.json .
RUN cargo chef cook --release
COPY ./Cargo.toml ./Cargo.lock ./
COPY ./src ./src
RUN cargo build --release

FROM bitnami/pgbouncer:1.22.1

USER root

ENV PGBOUNCER_PORT=8300
ENV PGBOUNCER_DATABASE=martletplace
ENV PGBOUNCER_LOG_STATS=0
ENV PGBOUNCER_MAX_CLIENT_CONN 400

RUN apt update && apt install -y supervisor

COPY supervisord.conf /etc/supervisord.conf

COPY --from=builder /build/target/release/datalayer /datalayer

ENTRYPOINT ["/bin/sh", "-c", "supervisord"]
