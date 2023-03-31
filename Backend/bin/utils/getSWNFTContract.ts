import dotenv from "dotenv";
import { ethers, Wallet } from "ethers";

import swNFTUpgrade from "../../shared/abi/SWNFTUpgrade.json";
dotenv.config();

let provider, contract, wallet;

const getContract = (chainId: string): any => {
  if (!process.env["BOT_PRIVATE_KEY"]) {
    throw new Error("BOT_PRIVATE_KEY not set");
  }

  if (chainId == "1") {
    if (!process.env["MAIN_NODE_URL"]) {
      throw new Error("MAIN_NODE_URL not set");
    }
    if (!process.env["MAIN_SWNFT_ADDRESS"]) {
      throw new Error("MAIN_SWNFT_ADDRESS not set");
    }
    provider = new ethers.providers.JsonRpcProvider({
      url: process.env["MAIN_NODE_URL"],
    });
    wallet = new Wallet(process.env["BOT_PRIVATE_KEY"], provider);
    contract = new ethers.Contract(
      process.env["MAIN_SWNFT_ADDRESS"],
      swNFTUpgrade,
      wallet
    );
  } else if (chainId == "5") {
    if (!process.env["GOERLI_NODE_URL"]) {
      throw new Error("GOERLI_NODE_URL not set");
    }
    if (!process.env["GOERLI_SWNFT_ADDRESS"]) {
      throw new Error("GOERLI_SWNFT_ADDRESS not set");
    }
    provider = new ethers.providers.JsonRpcProvider({
      url: process.env["GOERLI_NODE_URL"],
    });
    wallet = new Wallet(process.env["BOT_PRIVATE_KEY"], provider);
    contract = new ethers.Contract(
      process.env["GOERLI_SWNFT_ADDRESS"],
      swNFTUpgrade,
      wallet
    );
  } else if (chainId == "2077117572") {
    if (!process.env["KALEIDO_NODE_URL"]) {
      throw new Error("KALEIDO_NODE_URL not set");
    }
    if (!process.env["KALEIDO_SWNFT_ADDRESS"]) {
      throw new Error("KALEIDO_SWNFT_ADDRESS not set");
    }
    provider = new ethers.providers.JsonRpcProvider({
      url: process.env["KALEIDO_NODE_URL"],
      user: process.env["KALEIDO_NODE_USER"] || "",
      password: process.env["KALEIDO_NODE_PASSWORD"] || "",
    });
    wallet = new Wallet(process.env["BOT_PRIVATE_KEY"], provider);
    contract = new ethers.Contract(
      process.env["KALEIDO_SWNFT_ADDRESS"],
      swNFTUpgrade,
      wallet
    );
  } else {
    if (!process.env["KILN_NODE_URL"]) {
      throw new Error("KILN_NODE_URL not set");
    }
    if (!process.env["KILN_SWNFT_ADDRESS"]) {
      throw new Error("KILN_SWNFT_ADDRESS not set");
    }
    provider = new ethers.providers.JsonRpcProvider({
      url: process.env["KILN_NODE_URL"],
    });
    wallet = new Wallet(process.env["BOT_PRIVATE_KEY"], provider);
    contract = new ethers.Contract(
      process.env["KILN_SWNFT_ADDRESS"],
      swNFTUpgrade,
      wallet
    );
  }

  return contract;
};

export { getContract };
