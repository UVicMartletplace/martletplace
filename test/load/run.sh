#!/usr/bin/env bash
set -euo pipefail

# Ensure that all services are fresh & the DB isn't accruing crud from previous loadtests
docker compose restart user listing review message recommend search
docker compose down -v database
docker compose up --build --wait database
docker compose restart user listing review message recommend search

cargo run --release
