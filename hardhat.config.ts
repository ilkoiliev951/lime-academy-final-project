import { HardhatUserConfig } from "hardhat/types";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import secrets from './secrets.json';
import "./scripts/deployment/hardhat-tasks/customDeploy";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: secrets.INFURA_SEPOLIA_URL,
      accounts: [secrets.PRIVATE_KEY],
    },
    goerli: {
      url: secrets.INFURA_SEPOLIA_URL,
      accounts: [secrets.PRIVATE_KEY],
    },
    development: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: secrets.ETHERSCAN_KEY
  }
};

export default config;