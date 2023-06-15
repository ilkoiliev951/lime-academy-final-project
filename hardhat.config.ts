import { HardhatUserConfig } from "hardhat/types";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import secrets from './secrets.json';
import "./scripts/deployment/customDeploy";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: secrets.INFURA_SEPOLIA_URL,
      accounts: [secrets.PRIVATE_KEY],
      allowUnlimitedContractSize: true,
      gasLimit: 5000000,
      gas: 5000000
    },
    goerli: {
      url: secrets.INFURA_GOERLI_URL,
      accounts: [secrets.PRIVATE_KEY],
      allowUnlimitedContractSize: true,
      gasLimit: 5000000,
      gas: 5000000
    },
    development: {
      url: "http://127.0.0.1:8545",
      gasLimit: 5000000,
      gas: 5000000
    },
  },
  etherscan: {
    apiKey: secrets.ETHERSCAN_KEY
  },
};

export default config;