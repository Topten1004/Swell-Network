require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require("hardhat-abi-exporter");
require("hardhat-contract-sizer");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");
require("solidity-coverage");
require("./deploy/deploy");
require("./deploy/deployMultisender");
require("./deploy/upgrade");
require("./deploy/upgradeFromMultisig");
require("./deploy/verify");
require("./bin/dispatchETH");
require("./bin/addWhiteLists");
require("./bin/updateIsValidatorsActive");

const LOW_OPTIMIZER_COMPILER_SETTINGS = {
  version: "0.8.9",
  settings: {
    evmVersion: "istanbul",
    optimizer: {
      enabled: true,
      runs: 110,
      details: {
        yul: false,
      },
    },
    metadata: {
      bytecodeHash: "none",
    },
  },
};

const DEFAULT_COMPILER_SETTINGS = {
  version: "0.8.9",
  settings: {
    evmVersion: "istanbul",
    optimizer: {
      enabled: true,
      runs: 200,
      details: {
        yul: false,
      },
    },
    metadata: {
      bytecodeHash: "none",
    },
  },
};

const UNISWAP_COMPILER_SETTINGS = {
  version: "0.8.9",
  settings: {
    evmVersion: "istanbul",
    optimizer: {
      enabled: true,
      runs: 1,
      details: {
        yul: true,
      },
    },
    metadata: {
      bytecodeHash: "none",
    },
  },
};

module.exports = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        url:
          "https://eth-mainnet.alchemyapi.io/v2/" + process.env.ALCHEMY_API_KEY,
      },
      blockNumber: 14439914, // latest as of (04/05/22)
      mining: {
        auto: true,
      },
    },
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    "goerli-main": {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    kaleido: {
      url: process.env.KALEIDO_RPC_URL ? process.env.KALEIDO_RPC_URL : "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    "kaleido-main": {
      url: process.env.KALEIDO_RPC_URL ? process.env.KALEIDO_RPC_URL : "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    kiln: {
      url: process.env.KILN_RPC_URL ? process.env.KILN_RPC_URL : "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
    overrides: {
      "contracts/swNFTUpgrade.sol": LOW_OPTIMIZER_COMPILER_SETTINGS,
      "contracts/libraries/NFTDescriptor.sol": LOW_OPTIMIZER_COMPILER_SETTINGS,
      "contracts/tests/TestswNFTUpgrade.sol": LOW_OPTIMIZER_COMPILER_SETTINGS,
      "contracts/tests/swNFTUpgradeTestnet.sol":
        LOW_OPTIMIZER_COMPILER_SETTINGS,
      "contracts/latest-tag/tests/TestswNFTUpgrade.sol":
        LOW_OPTIMIZER_COMPILER_SETTINGS,
      "contracts/latest-tag/tests/swNFTUpgradeTestnet.sol":
        LOW_OPTIMIZER_COMPILER_SETTINGS,
      "contracts/SwellIzumiVault.sol": UNISWAP_COMPILER_SETTINGS,
    },
  },
  abiExporter: {
    clear: true,
    flat: true,
    runOnCompile: true,
    only: ["SWETH", "SWNFTUpgrade", "SWELL", "Strategy", "SWNFTUpgradeTestnet"],
    except: ["contracts/latest-tag"],
  },
  gasReporter: {
    showTimeSpent: true,
    gasPrice: 100,
    // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
  mocha: {
    timeout: 100000000,
  },
};
