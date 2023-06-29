#!/usr/bin/env bash

cd ..
npx hardhat node &
sleep 10

npx hardhat deploy-custom --network development
npx hardhat deploy-custom --network sepolia