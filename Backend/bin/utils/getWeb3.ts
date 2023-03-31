import dotenv from "dotenv";
import { ethers, Wallet } from "ethers";
dotenv.config();

const getWeb3 = (chainId: string): { wallet: any; provider: any } => {
  let provider, wallet;

  if (!process.env["BOT_PRIVATE_KEY"]) {
    throw new Error("BOT_PRIVATE_KEY not set");
  }

  if (chainId == "1") {
    if (!process.env["MAIN_NODE_URL"]) {
      throw new Error("MAIN_NODE_URL not set");
    }
    provider = new ethers.providers.JsonRpcProvider({
      url: process.env["MAIN_NODE_URL"],
    });
    wallet = new Wallet(process.env["BOT_PRIVATE_KEY"], provider);
  } else if (chainId == "5") {
    if (!process.env["GOERLI_NODE_URL"]) {
      throw new Error("GOERLI_NODE_URL not set");
    }
    provider = new ethers.providers.JsonRpcProvider({
      url: process.env["GOERLI_NODE_URL"],
    });
    wallet = new Wallet(process.env["BOT_PRIVATE_KEY"], provider);
  } else if (chainId == "2077117572") {
    if (!process.env["KALEIDO_NODE_URL"]) {
      throw new Error("KALEIDO_NODE_URL not set");
    }
    provider = new ethers.providers.JsonRpcProvider({
      url: process.env["KALEIDO_NODE_URL"],
      user: process.env["KALEIDO_NODE_USER"] || "",
      password: process.env["KALEIDO_NODE_PASSWORD"] || "",
    });
    wallet = new Wallet(process.env["BOT_PRIVATE_KEY"], provider);
  } else {
    if (!process.env["KILN_NODE_URL"]) {
      throw new Error("KILN_NODE_URL not set");
    }
    provider = new ethers.providers.JsonRpcProvider({
      url: process.env["KILN_NODE_URL"],
    });
    wallet = new Wallet(process.env["BOT_PRIVATE_KEY"], provider);
  }

  return { wallet, provider };
};

export { getWeb3 };
