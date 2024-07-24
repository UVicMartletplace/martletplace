#!/usr/bin/env bash
set -euo pipefail
REGION="us-west-2"
AWS_ACOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
REPO_NAME="martletplace"
VER_TAG="latest"
REPO_URL="${AWS_ACOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
REPO_PATH="${REPO_URL}/${REPO_NAME}"

aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${REPO_URL}"

push() {
  local image=$1
  docker tag "martletplace-${image}" "${REPO_PATH}/${image}:${VER_TAG}"
  docker push "${REPO_PATH}/${image}:${VER_TAG}"
}

for item in user listing review message search recommend frontend; do
  push $item
done
