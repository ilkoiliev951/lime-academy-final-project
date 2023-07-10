#!/usr/bin/env bash

cd ../docker

## start the db docker image
docker-compose up -d
echo "Started PSQL DB Container contract deployment"

cd ../

## start the validator api
npx ts-node scripts/validator-service/server.ts &
echo "Started Validator API Service"

## start the event listener
npx ts-node scripts/event-listener-service/eventListener.ts &
echo "Started Event Listener Service"