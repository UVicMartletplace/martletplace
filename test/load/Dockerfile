FROM lukemathwalker/cargo-chef:latest AS chef
WORKDIR /app

FROM chef AS planner
COPY ./Cargo.toml ./Cargo.lock ./
COPY ./src ./src
RUN cargo chef prepare

FROM chef AS builder
COPY --from=planner /app/recipe.json .
RUN apt update && apt install -y cmake
RUN cargo chef cook --release
COPY . .
RUN cargo build --release
RUN mv ./target/release/loadtest ./app

FROM rust AS runtime
WORKDIR /app
COPY --from=builder /app/app /usr/local/bin/
ENTRYPOINT bash -c "while true; do /usr/local/bin/app --worker --manager-host \"$MANAGER_HOST\"; sleep 100; done"
