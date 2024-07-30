#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
DB_DIR="${ROOT_DIR}/apps/data/database/"
DB_ENDPOINT=$(terraform show -json | jq -r '.values.root_module.resources[] | select(.address=="aws_secretsmanager_secret_version.database_url_version") | .values.secret_string')

#psql "$DB_ENDPOINT"; exit

echo "Preparing SQL"
csvsource -f "${DB_DIR}/recommender/trainingData.csv" --table listings -w true -i 1000 -y true #cargo install csvsource

echo "Deleting data"
psql "$DB_ENDPOINT" -c "DROP TABLE IF EXISTS charities, listings, messages, organizations, reviews, user_clicks, user_preferences, user_searches, users CASCADE; DROP FUNCTION IF EXISTS trigger_update_modified CASCADE; DROP TYPE IF EXISTS status_type, location_type CASCADE;"

echo "Inserting data"
psql "$DB_ENDPOINT" -f "${DB_DIR}/initdb.sql"
psql "$DB_ENDPOINT" -f "${DB_DIR}/populatedb.sql"
psql "$DB_ENDPOINT" -f "trainingData.sql"
