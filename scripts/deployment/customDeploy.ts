require("hardhat/config");
import {task, subtask} from "hardhat/config";

task("deploy-custom", "Deploys a custom contract")
    .setAction(async (taskArgs, {run}) => {
        const {ethers} = require("hardhat");
        const bridgeContractFactory = await ethers.getContractFactory("EVMBridge");
        const bridge = await bridgeContractFactory.deploy();
        await bridge.deployed();
        console.log(`The Bridge Contract was deployed to ${bridge.address}`);

        let subtaskArgs = {
            address: bridge.address,
            hash: bridge.deployTransaction.hash,
            senderAddress: bridge.deployTransaction.from
        }
        await run("print-custom-deployment-info", subtaskArgs);
    });

subtask("print-custom-deployment-info", "Prints information about the contract after successful deployment.")
    .setAction(async (taskArgs) => {
        await console.log("Deployment Information:");
        await console.log(`- Contract Name: Library`);
        await console.log(`- Contract Address: ${taskArgs.address}`);
        await console.log(`- Transaction Hash: ${taskArgs.hash}`);
        await console.log(`- Deployer Address: ${taskArgs.senderAddress}`);
    });