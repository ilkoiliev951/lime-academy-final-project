require("hardhat/config");
import {task, subtask} from "hardhat/config";

// task("deploy-custom", "Deploys a custom contract")
//     .setAction(async (taskArgs, {run}) => {
//         const {ethers} = require("hardhat");
//         const libraryContractFactory = await ethers.getContractFactory("Library");
//         const library = await libraryContractFactory.deploy();
//         await library.deployed();
//         console.log(`The Library Contract was deployed to ${library.address}`);
//
//         let subtaskArgs = {
//             address: library.address,
//             hash: library.deployTransaction.hash,
//             senderAddress: library.deployTransaction.from
//         }
//         await run("print-custom-deployment-info", subtaskArgs);
//     });
//
// subtask("print-custom-deployment-info", "Prints information about the contract after successful deployment.")
//     .setAction(async (taskArgs) => {
//         await console.log("Deployment Information:");
//         await console.log(`- Contract Name: Library`);
//         await console.log(`- Contract Address: ${taskArgs.address}`);
//         await console.log(`- Transaction Hash: ${taskArgs.hash}`);
//         await console.log(`- Deployer Address: ${taskArgs.senderAddress}`);
//     });