import { Wallet } from "ethers";

import { prismaFactory, server } from "../../app";
import {
  CREATE_DEPOSIT_DATA_BY_VALIDATOR_FROM_JSON,
  CREATE_NODE_OPERATOR,
  CREATE_OR_UPDATE_USER,
  GET_NONCE_BY_USER,
} from "../../shared/graphql";
import validDepositdata from "../misc/validDepositdata.json";
import { nodeOperatorCreateInput } from "./constants";

const sleep = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, timeout);
  });
};

const getSignature = async (
  wallet: Wallet
): Promise<{
  signature: string;
  wallet: string;
  timestamp: number;
}> => {
  const res: any = await server.executeOperation({
    query: GET_NONCE_BY_USER,
    variables: {
      userUniqueInput: {
        wallet: wallet.address,
      },
    },
  });

  const { nonce, timestamp } = res.data.nonceByUser;
  const signature = await wallet.signMessage(
    `I am signing my one-time nonce: ${nonce}`
  );

  return {
    signature,
    wallet: wallet.address,
    timestamp,
  };
};

const createNodeOperator = async (wallet: Wallet) => {
  const validUserNodeOperatorCreateInput = {
    wallet: wallet.address,
    nodeOperator: nodeOperatorCreateInput,
  };
  const validUserSignatureInput = await getSignature(wallet);

  // call
  try {
    const res: any = await server.executeOperation({
      query: CREATE_NODE_OPERATOR,
      variables: {
        userNodeOperatorCreateInput: validUserNodeOperatorCreateInput,
        userSignatureInput: validUserSignatureInput,
      },
    });
    return res.data.createNodeOperator;
  } catch (err) {
    return false;
  }
};

const createUser = async (wallet: Wallet, referralCode?: string) => {
  const createUserInput = {
    wallet: wallet.address,
    referralCode: referralCode || "test referral code",
  };
  const userSignatureInput = await getSignature(wallet);

  // call
  try {
    const res: any = await server.executeOperation({
      query: CREATE_OR_UPDATE_USER,
      variables: {
        createOrUpdateUserInput: createUserInput,
        userSignatureInput,
      },
    });

    return res.data.createOrUpdateUser;
  } catch (err) {
    return false;
  }
};

const createReferral = async (userId: string, referralWalletAddr: string) => {
  const prisma = prismaFactory.getPrisma(process.env["CHAIN_ID"] || "1");

  // call
  try {
    const res = await prisma.Faucet.create({
      data: {
        wallet: referralWalletAddr,
        userId,
        discordId: "test discord id",
      },
    });
    return res;
  } catch (err) {
    return false;
  }
};

const getReferralById = async (id: string) => {
  const prisma = prismaFactory.getPrisma(process.env["CHAIN_ID"] || "1");

  // call
  try {
    const res = await prisma.Faucet.findUnique({
      where: { id },
    });

    return res;
  } catch (err) {
    return false;
  }
};

const createDepositData = async (account: Wallet, nodeOperatorId: string) => {
  // prepare mutation variables
  const nodeOperatorUniqueInput = {
    id: nodeOperatorId,
  };
  const depositDataCreateWithJsonInput = {
    data: JSON.stringify(validDepositdata),
    pubKey:
      "0x8e1d21c1e453436b107bbaf2e4d38350da87034e06a1c4931f234dd707ab71b1d1189e009ebd7f33c8d69f4914922dc9",
  };
  const userSignatureInput = await getSignature(account);

  try {
    // call
    const res: any = await server.executeOperation({
      query: CREATE_DEPOSIT_DATA_BY_VALIDATOR_FROM_JSON,
      variables: {
        nodeOperatorUniqueInput,
        depositDataCreateWithJsonInput,
        userSignatureInput,
      },
    });
    return res;
  } catch (err) {
    console.log("err:");
  }
};

const getNodeOperatorByUserId = async (userId: string) => {
  const prisma = prismaFactory.getPrisma(process.env["CHAIN_ID"] || "1");

  try {
    const res: any = await prisma.NodeOperator.findFirst({
      where: { userId },
    });
    return res;
  } catch (err) {
    console.log("err:", err);
    return false;
  }
};

const getValidatorByNodeOperator = async (nodeOperatorId: string) => {
  const prisma = prismaFactory.getPrisma(process.env["CHAIN_ID"] || "1");

  try {
    const res: any = await prisma.Validator.findFirst({
      where: { nodeOperatorId },
    });
    return res;
  } catch (err) {
    console.log("err:", err);
    return false;
  }
};

const activateValidator = async (validatorId: string) => {
  const prisma = prismaFactory.getPrisma(process.env["CHAIN_ID"] || "1");
  try {
    await prisma.Validator.update({
      where: { id: validatorId },
      data: {
        status: true,
      },
    });
  } catch (err) {
    console.log("err:", err);
    return false;
  }
};

const deleteAll = async () => {
  const prisma = prismaFactory.getPrisma(process.env["CHAIN_ID"] || "1");

  try {
    const tablenames =
      await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    for (const { tablename } of tablenames) {
      if (tablename !== "_prisma_migrations") {
        try {
          await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
          );
        } catch (error) {
          console.log({ error });
        }
      }
    }
  } catch (e) {
    console.log("error", e);
  }
};

export {
  sleep,
  getSignature,
  createNodeOperator,
  createUser,
  createReferral,
  createDepositData,
  getNodeOperatorByUserId,
  getReferralById,
  getValidatorByNodeOperator,
  activateValidator,
  deleteAll,
};
