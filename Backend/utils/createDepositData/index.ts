import { ethers } from "ethers";
import { exec } from "child_process";
import fs from "fs";
import util from "util";
import validator from "validator";

import { getForkVersion } from "../../bin/utils/getForkVersion";
import { PINNED_ETHDO_VERSION } from "../../constants/dependencies";

const execProm = util.promisify(exec);

const assertIsHexPrefix = (data: string, type: string) => {
  if (typeof data !== "string") throw Error("Invalid " + type);
  if (data.substring(0, 2) !== "0x") throw Error("Invalid " + type);
};

const assertValidDepositData = (depositData: any) => {
  if (!depositData) throw Error("No deposit data");
  if (typeof depositData !== "object")
    throw Error("Deposit data not an object");

  const keys = [
    "pubkey",
    "withdrawal_credentials",
    "signature",
    "deposit_data_root",
    "deposit_message_root",
    "fork_version",
  ];

  for (let i = 0; i < keys.length; i++) {
    const key: any = keys[i];
    assertIsHexPrefix(depositData[key], key);
  }
};

const getCommand = (
  chainid: string,
  pubKey: string,
  withdrawalAddress: string,
  amount: string,
  withDocker: boolean
) => {
  let commandWithVersion = "ethdo";
  if (withDocker) commandWithVersion += ":" + PINNED_ETHDO_VERSION;

  const cmd = `${commandWithVersion} deposit verify --data=/tmp/deposit-data.json --validatorpubkey=${pubKey} --withdrawaladdress=${withdrawalAddress} --depositvalue=${amount}Ether ${getForkVersion(
    chainid
  )}`;

  // Example: wealdtech/ethdo:1.25.0 when withDocker = true and PINNED_ETHDO_VERSION = 1.25.0
  if (withDocker) {
    return `docker run -v /tmp:/tmp wealdtech/${cmd}`;
  } else {
    return cmd;
  }
};

const validateDepositData = async (
  chainid: string,
  depositData: any,
  pubKey: string,
  withdrawalAddress: string,
  amount: string,
  withDocker: boolean
) => {
  if (!validator.isHexadecimal(depositData.pubkey))
    throw Error("Pubkey not valid");
  if (!validator.isInt(amount, { min: 1 })) throw Error("Amount not valid");
  await assertValidDepositData(depositData);

  // generate depositData.json file
  try {
    await fs.writeFileSync(
      `/tmp/deposit-data.json`,
      JSON.stringify(depositData)
    );
  } catch (err) {
    console.log(err);
    throw new Error(`JSON file save error`);
  }

  try {
    const cmd: any = getCommand(
      chainid,
      pubKey,
      withdrawalAddress,
      amount,
      withDocker
    );
    const result = await execProm(cmd);
    if (!result) {
      throw new Error(`Invalid Deposit data`);
    }
  } catch (e) {
    throw new Error(`Deposit data verification error`);
  }
};

const createSingleDepositData = async (
  prisma: any,
  chainid: string,
  withdrawalAddress: string,
  pubKey: string,
  depositData: any,
  nodeOperatorUniqueInput: any
) => {
  const amount = ethers.utils.formatEther(depositData.amount).toString();

  await validateDepositData(
    chainid,
    depositData,
    pubKey,
    withdrawalAddress,
    amount,
    true
  );

  const validator = await prisma.Validator.findUnique({
    where: {
      pubKey: depositData.pubkey || undefined,
    },
  });
  if (validator) {
    if (validator.nodeOperatorId !== nodeOperatorUniqueInput.id) {
      throw new Error(
        `Validator pubkey was already taken in another node operator`
      );
    }
    return prisma.Validator.update({
      where: { pubKey: depositData.pubkey },
      data: {
        depositDatas: {
          upsert: {
            create: {
              signature: depositData.signature,
              depositDataRoot: depositData.deposit_data_root,
              amount: amount,
            },
            update: {
              signature: depositData.signature,
              depositDataRoot: depositData.deposit_data_root,
              amount: amount,
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
      include: {
        depositDatas: true,
      },
    });
  } else {
    return prisma.Validator.create({
      data: {
        pubKey: depositData.pubkey,
        nodeOperatorId: nodeOperatorUniqueInput.id,
        depositDatas: {
          create: {
            signature: depositData.signature,
            depositDataRoot: depositData.deposit_data_root,
            amount: amount,
          },
        },
        status: false,
      },
      include: {
        depositDatas: true,
      },
    });
  }
};

const createDepositData = async (
  prisma: any,
  chainid: string,
  withdrawalAddress: string,
  depositDataCreateWithJsonInput: any,
  nodeOperatorUniqueInput: any
) => {
  const pubKey = depositDataCreateWithJsonInput.pubKey;
  const depositData = JSON.parse(depositDataCreateWithJsonInput.data);

  if (Array.isArray(depositData)) {
    const promises = depositData.map((item) =>
      createSingleDepositData(
        prisma,
        chainid,
        withdrawalAddress,
        pubKey,
        item,
        nodeOperatorUniqueInput
      )
    );
    return await Promise.all(promises);
  } else {
    return await createSingleDepositData(
      prisma,
      chainid,
      withdrawalAddress,
      pubKey,
      depositData,
      nodeOperatorUniqueInput
    );
  }
};

export { createDepositData, validateDepositData };
