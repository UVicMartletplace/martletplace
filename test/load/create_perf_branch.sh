#!/usr/bin/env bash
set -euo pipefail

git stash --include-untracked
CURRENT_HEAD=$(git rev-parse HEAD)

git merge #Add all perf branches here

git reset --soft "$CURRENT_HEAD"
git stash pop
