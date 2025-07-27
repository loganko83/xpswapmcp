require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    xphere: {
      url: process.env.XPHERE_RPC_URL || "https://en-bkk.x-phere.com",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 20250217,
      gasPrice: 50000000000, // 50 Gwei
      gas: 8000000
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD"
  },
  etherscan: {
    apiKey: {
      xphere: "dummy-api-key" // Xphere용 임시 키
    },
    customChains: [
      {
        network: "xphere",
        chainId: 20250217,
        urls: {
          apiURL: "https://en-bkk.x-phere.com/api",
          browserURL: "https://en-bkk.x-phere.com"
        }
      }
    ]
  }
};
