#!/usr/bin/env bash

cd ../
hardhat deploy-custom --network sepolia
hardhat deploy-custom --network goerli
hardhat deploy-custom --network development