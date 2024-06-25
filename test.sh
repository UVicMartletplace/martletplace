#!/bin/bash

docker compose up

docker compose exec user npm --prefix ../lib install
docker compose exec user npm --prefix ../lib run test:ci
docker compose exec listing npm run test:ci
docker compose exec review npm run test:ci
docker compose exec message npm run test:ci
docker compose exec lib npm run test:ci
docker compose exec search pytest
docker compose exec recommend pytest
npm ci
npm run test

docker compose down