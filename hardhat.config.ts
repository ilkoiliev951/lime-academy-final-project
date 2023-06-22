import { HardhatUserConfig } from "hardhat/types";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import secrets from './secrets.json';
import "./scripts/deployment/customDeploy";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: secrets.INFURA_SEPOLIA_URL,
      accounts: [secrets.PRIVATE_KEY],
      allowUnlimitedContractSize: true,
    },
    goerli: {
      url: secrets.INFURA_GOERLI_URL,
      accounts: [secrets.PRIVATE_KEY],
      allowUnlimitedContractSize: true,
    },
    development: {
      url: "http://127.0.0.1:8545",
      allowUnlimitedContractSize: true,
      chainId: 13337
    },
  },
  etherscan: {
    apiKey: secrets.ETHERSCAN_KEY
  },
};

export default config;