#!/bin/bash

docker compose up

docker compose exec user npm run test
docker compose exec listing npm run test
docker compose exec review npm run test
docker compose exec message npm run test
docker compose exec lib npm run test
docker compose exec search pytest
docker compose exec recommend pytest
npm ci
npm run test

docker compose down