import { exec } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import util from "util";

import { context } from "../../context";
import { getForkVersion } from "./getForkVersion";
import { getContract } from "./getSWNFTContract";
dotenv.config();
const execProm = util.promisify(exec);

let result: any;

if (!process.env["ETHDO_LAST_ACCOUNT_INDEX"]) {
  throw new Error("ETHDO_LAST_ACCOUNT_INDEX not set");
}
const ethdo_last_account_index = Number(
  process.env["ETHDO_LAST_ACCOUNT_INDEX"]
);
if (!process.env["ETHDO_CREATE_ACCOUNT"]) {
  throw new Error("ETHDO_CREATE_ACCOUNT not set");
}
const ethdo_create_account = Number(process.env["ETHDO_CREATE_ACCOUNT"]);
if (!process.env["ETHDO_PASSPHRASE"]) {
  throw new Error("ETHDO_PASSPHRASE not set");
}
if (!process.env["DEFAULT_SWELL_NETWORK_NODE_OPERATOR_ID"]) {
  throw new Error("DEFAULT_SWELL_NETWORK_NODE_OPERATOR_ID not set");
}
if (!process.env["GOERLI_FORK_VERSION"]) {
  throw new Error("GOERLI_FORK_VERSION not set");
}
if (!process.env["CHAIN_ID"]) {
  throw new Error("CHAIN_ID not set");
}

const nodeOperatorId = Number(
  process.env["DEFAULT_SWELL_NETWORK_NODE_OPERATOR_ID"]
);

const validators: any[] = [];

const createDepositData = async () => {
  const contract = getContract(process.env["CHAIN_ID"] || "1");

  for (
    let i = ethdo_last_account_index + 1;
    i < ethdo_create_account + ethdo_last_account_index + 1;
    i++
  ) {
    try {
      result = await execProm(
        `docker run -v $HOME/.config/ethereum2/wallets:/data wealdtech/ethdo account create --account=wallet/account${i} --base-dir=/data --passphrase='${process.env["ETHDO_PASSPHRASE"]}'`
      );
      console.log("result: ", result);
    } catch (e) {
      console.log("error: ", e);
    }

    for (let j = 1; j <= 31; j++) {
      result = await execProm(
        `docker run -v $HOME/.config/ethereum2/wallets:/data wealdtech/ethdo --base-dir=/data validator depositdata --withdrawaladdress=${
          contract.address
        } --depositvalue='${j} Ether' --validatoraccount=wallet/account${i} --passphrase='${
          process.env["ETHDO_PASSPHRASE"]
        }' ${getForkVersion(process.env["CHAIN_ID"] || "1")}`
      );
      result = JSON.parse(result.stdout)[0];
      console.log("result: ", result);
      if (j === 1) validators.push(result.pubkey);
      const validator = await context.prisma.Validator.findUnique({
        where: {
          pubKey: result.pubkey,
        },
      });
      const amount = (result.amount / 1e9).toString();
      if (validator) {
        await context.prisma.Validator.update({
          where: { id: validator.id },
          data: {
            depositDatas: {
              upsert: {
                create: {
                  amount: amount,
                  signature: result.signature,
                  depositDataRoot: result.deposit_data_root,
                },
                update: {
                  amount: amount,
                  signature: result.signature,
                  depositDataRoot: result.deposit_data_root,
                },
                where: {
                  validatorAmount: {
                    validatorId: validator.id,
                    amount: amount,
                  },
                },
              },
            },
          },
        });
      } else {
        await context.prisma.Validator.create({
          data: {
            pubKey: result.pubkey,
            nodeOperatorId: nodeOperatorId,
            depositDatas: {
              create: {
                amount: amount,
                signature: result.signature,
                depositDataRoot: result.deposit_data_root,
              },
            },
            status: false,
          },
        });
      }
    }
  }
  // convert JSON object to string
  const data = JSON.stringify({ validators: validators }, null, 2);

  // write to version file
  fs.writeFileSync("./whitelist_validators.json", data);
};

export default createDepositData;
