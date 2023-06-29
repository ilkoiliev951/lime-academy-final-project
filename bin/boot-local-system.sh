#!/usr/bin/env bash

cd ../docker

## start the db docker image
docker-compose up -d
echo "Started PSQL DB Container contract deployment"

## start the hardhat local node
cd ../
npx hardhat node &

# wait for the hardhat node to boot up
sleep 10
echo "Started local hardhat node"

##
cd bin
echo "Starting contract deployment"
sudo chmod 755 deploy.sh
./deploy.sh

cd ../

## start the api
npx ts-node scripts/api/server.ts

## start the validator api
npx ts-node scripts/validator-service/server.ts

## start the event listener
npx ts-node scripts/event-listener-service/eventListener.ts