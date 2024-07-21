#!/usr/bin/env bash
set -euo pipefail

docker compose restart user listing review message recommend search
docker compose down -v database
docker compose up --build --wait database
docker compose restart user listing review message recommend search

cargo run --release

