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

        await run("print-custom-deployment-info", buildSubtaskArgs(bridge));

        if (network.name === 'sepolia' || network.name === 'development') {
            const genericERC20ContractFactory = await ethers.getContractFactory("GenericERC20");
            const genericERC20 = await genericERC20ContractFactory.deploy();
            await genericERC20 .deployed();
            await run("print-custom-deployment-info", buildSubtaskArgs(genericERC20));
        }

        if (network.name === 'goerli' || network.name === 'development') {
            const wrappedERC20ContractFactory = await ethers.getContractFactory("WrappedERC20");
            const wrappedERC20 = await wrappedERC20ContractFactory.deploy();
            await wrappedERC20 .deployed();
            await run("print-custom-deployment-info", buildSubtaskArgs(wrappedERC20));
        }
    });

subtask("print-custom-deployment-info", "Prints information about the contract after successful deployment.")
    .setAction(async (taskArgs) => {
        await console.log("Deployment Information:");
        await console.log(`- Contract Name: Library`);
        await console.log(`- Contract Address: ${taskArgs.address}`);
        await console.log(`- Transaction Hash: ${taskArgs.hash}`);
        await console.log(`- Deployer Address: ${taskArgs.senderAddress}`);
    });

async function buildSubtaskArgs (contract: Contract) {
    return {
        address: contract.address,
        hash: contract.deployTransaction.hash,
        senderAddress: contract.deployTransaction.from
    };
}