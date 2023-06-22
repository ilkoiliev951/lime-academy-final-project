import {Contract} from "ethers";
import {subtask, task} from "hardhat/config";
import {ethers} from "hardhat";

require("hardhat/config");

task("deploy-custom", "Deploys a custom contract")
    .setAction(async (taskArgs, {run, network}) => {
        const {ethers} = require("hardhat");
        const bridgeContractFactory = await ethers.getContractFactory("EVMBridge");
        const bridge = await bridgeContractFactory.deploy();
        await bridge.deployed();
        console.log(`The Bridge Contract was deployed to ${bridge.address}`);

        await run("print-custom-deployment-info", buildSubtaskArgs(bridge, "EVMBridge"));
    });

subtask("print-custom-deployment-info", "Prints information about the contract after successful deployment.")
    .setAction(async (taskArgs) => {
        await console.log("Deployment Information:");
        await console.log(`- Contract Name: ${taskArgs.name}`);
        await console.log(`- Contract Address: ${taskArgs.address}`);
        await console.log(`- Transaction Hash: ${taskArgs.hash}`);
        await console.log(`- Deployer Address: ${taskArgs.senderAddress}`);
    });

async function buildSubtaskArgs (contract: Contract, contractName: string) {
    return {
        name: contractName,
        address: contract.address,
        hash: contract.deployTransaction.hash,
        senderAddress: contract.deployTransaction.from
    };
}
