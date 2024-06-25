#!/bin/bash

backend_services=("user" "listing" "review" "message" "lib", "search" "recommend")
algorithm_services=("search" "recommend")

 docker compose up

run_backend_test() {
  local service=$1

  echo "Running tests for service: $service"
  if [[ $service == 'lib' ]]; then
    docker compose exec user npm install --prefix ../lib
  fi

  docker compose exec $( [[ $service == 'lib' ]] && echo "user" || echo $service ) npm run $( [[ $service == 'lib' ]] && echo "--prefix ../lib" || echo "" )
}

run_algorithm_test() {
  local service=$1

  echo "Running algorithm tests for service: $service"
  docker compose exec $service pytest
}

run_frontend_test() {
  echo "Running frontend tests"
  npm ci
  npm run test
}

# Iterate through each backend service and run the tests
for service in "${backend_services[@]}"; do
  run_backend_test $service
done

# Iterate through each algorithm service and run the tests
for service in "${algorithm_services[@]}"; do
  run_algorithm_test $service
done

# Run frontend tests
for service in "${node_services[@]}"; do
  run_frontend_test
done

 docker compose down