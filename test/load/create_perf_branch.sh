#!/usr/bin/env bash
set -euo pipefail

git stash --include-untracked
CURRENT_HEAD=$(git rev-parse HEAD)

git merge max/speed-up-search max/search-database-connection resops/productionize-py-services max/optimize-db-indexes max/increase-pgbouncer-conn-limit max/lower-backend-logging max/test-remove-triggers

git reset --soft $CURRENT_HEAD
git stash pop
