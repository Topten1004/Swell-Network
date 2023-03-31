import axios from "axios";
import * as ethUtil from "ethereumjs-util";
import { BigNumber, ethers } from "ethers";
import { generateApiKey } from "generate-api-key";
import { DateTimeResolver } from "graphql-scalars";
import { GraphQLUpload } from "graphql-upload";
import nonceCache from "memory-cache";
import {
  arg,
  asNexusMethod,
  inputObjectType,
  list,
  makeSchema,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

import { OSSClientMock } from "./__tests__/utils/ossClientMock";
import { getWeb3 } from "./bin/utils/getWeb3";
import { OSSClient } from "./bin/utils/ossClient";
import { createDepositData } from "./utils/createDepositData";
import { saveFileToTmp } from "./utils/saveFile";

const DateTime = asNexusMethod(DateTimeResolver, "date");
const Upload = asNexusMethod(GraphQLUpload, "upload");
const ossClient =
  process.env["NODE_ENV"] === "test" ? new OSSClientMock() : new OSSClient();

const SignatureValidation = async (args: any): Promise<boolean> => {
  const nonce = nonceCache.get(
    `${args.userSignatureInput.wallet}-${args.userSignatureInput.timestamp}`
  );

  if (nonce == null || nonce == undefined) return false;
  nonceCache.del(
    `${args.userSignatureInput.wallet}-${args.userSignatureInput.timestamp}`
  );
  const msg = `I am signing my one-time nonce: ${nonce}`;
  const msgBuffer = Buffer.from(msg);
  const msgHash = ethUtil.hashPersonalMessage(msgBuffer);

  const signatureBuffer: any = ethUtil.toBuffer(
    args.userSignatureInput.signature
  );
  const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
  const publicKey = ethUtil.ecrecover(
    msgHash,
    signatureParams.v,
    signatureParams.r,
    signatureParams.s
  );
  const addressBuffer = ethUtil.publicToAddress(publicKey);
  const address = ethUtil.bufferToHex(addressBuffer);

  return address.toLowerCase() === args.userSignatureInput.wallet.toLowerCase();
};

const UserOwnerValidation = (
  userSignatureInput: any,
  wallet: string
): boolean => {
  return userSignatureInput.wallet.toLowerCase() === wallet.toLowerCase();
};

const NodeOperatorOwnerValidation = async (
  args: any,
  context: any
): Promise<boolean> => {
  const user = await context.prisma.NodeOperator.findUnique({
    where: { id: args.nodeOperatorUniqueInput.id },
  }).user({});

  return (
    user &&
    user.wallet.toLowerCase() === args.userSignatureInput.wallet.toLowerCase()
  );
};

const NodeOperatorRateValidation = async (args: any): Promise<boolean> => {
  const nopeOperatorRate = args.data.nodeOperator.rate || 0;

  if (nopeOperatorRate >= 0 && nopeOperatorRate <= 10) {
    return true;
  }
  return false;
};

const WalletValidation = (wallet: string): boolean => {
  return ethers.utils.isAddress(wallet);
};

const availableStakeAmount = async (args: any, context: any): Promise<any> => {
  const validators = await context.prisma.Validator.findMany({
    where: {
      nodeOperatorId: args.nodeOperatorUniqueInput.id || undefined,
      status: true,
      depositDatas: {
        some: {
          amount: {
            not: undefined,
          },
        },
      },
    },
  });

  let amount = ethers.utils.parseEther(args.amount ? args.amount : "0");
  let totalAmount: BigNumber = BigNumber.from(0);
  const validatorAmounts: any[] = [];

  for (let i = 0; i < validators.length; i++) {
    const validator = validators[i];
    const balance = ethers.BigNumber.from(validator.depositBalance || 0);

    // handle available stake amount
    const available = ethers.utils.parseEther("32").sub(balance);
    totalAmount = available.add(totalAmount);
    if (amount.toString() === "0") continue;

    // handle deposit datas
    if (amount.lte(available)) {
      validatorAmounts.push({
        validatorId: validator.id,
        amount: ethers.utils.formatEther(amount).slice(0, -2),
      });
      amount = ethers.BigNumber.from(0);
      break;
    } else {
      amount = amount.sub(available);
      validatorAmounts.push({
        validatorId: validator.id,
        amount: ethers.utils.formatEther(available).slice(0, -2),
      });
    }
  }

  return { amount, validatorAmounts, totalAmount };
};

const DiscordIdAuthorization = async (
  code: string,
  origin: string,
  chainId: string
): Promise<boolean | string> => {
  const params = new URLSearchParams();
  params.append("client_id", process.env["DISCORD_CLIENT_ID"] || "");
  params.append("client_secret", process.env["DISCORD_CLIENT_SECRET"] || "");
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  let redirectUri = origin;
  if (chainId === "5") redirectUri = origin + "/goerli-faucet";
  if (chainId === "2077117572") redirectUri = origin + "/kaleido-faucet";
  params.append("redirect_uri", redirectUri);

  const Response = await axios.post(
    `${process.env["DISCORD_API_URL"]}/oauth2/token`,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    }
  );

  if (Response.status == 200) {
    const guildmember = await axios.get(
      `${process.env["DISCORD_API_URL"]}/users/@me/guilds/907097149521678357/member`,
      {
        headers: { Authorization: `Bearer ${Response.data.access_token}` },
      }
    );
    if (guildmember.status == 200) {
      return (
        guildmember.data.user.username +
        "#" +
        guildmember.data.user.discriminator
      );
    }
    return false;
  }
  return false;
};

const generateUserApiKey = async (
  context: any,
  wallet: any
): Promise<string> => {
  const user = await context.prisma.User.findUnique({
    where: { wallet: wallet },
  });

  return user && user.apiKey ? user.apiKey : generateApiKey();
};

const Query = objectType({
  name: "Query",
  definition(t) {
    t.list.field("allUsers", {
      type: "User",
      resolve: (_parent, _args, context) => {
        return context.prisma.User.findMany();
      },
    });

    t.list.field("allNodeOperators", {
      type: "NodeOperator",
      resolve: (_parent, _args, context) => {
        return context.prisma.NodeOperator.findMany({
          include: {
            _count: {
              select: {
                validators: true,
              },
            },
          },
          where: {
            status: true,
            validators: {
              some: {
                status: true,
              },
            },
          },
          orderBy: [
            {
              verified: "desc",
            },
            {
              validators: {
                _count: "desc",
              },
            },
          ],
        });
      },
    });

    t.field("getUserByWallet", {
      type: "User",
      args: {
        userUniqueInput: nonNull(
          arg({
            type: "UserUniqueInput",
          })
        ),
      },
      resolve: (_parent, args, context) => {
        return context.prisma.User.findUnique({
          where: {
            wallet: args.userUniqueInput.wallet || undefined,
          },
        });
      },
    });

    t.list.field("getUsersByReferralCodes", {
      type: "User",
      args: {
        referralCodes: nonNull(list(arg({ type: "String" }))),
      },
      resolve: async (_parent, args, context) => {
        return context.prisma.User.findMany({
          where: {
            referralCode: { in: args.referralCodes },
          },
          select: {
            wallet: true,
            referralCode: true,
          },
        });
      },
    });

    t.field("nodeOperatorByUser", {
      type: "NodeOperator",
      args: {
        userUniqueInput: nonNull(
          arg({
            type: "UserUniqueInput",
          })
        ),
      },
      resolve: (_parent, args, context) => {
        return context.prisma.User.findUnique({
          where: {
            wallet: args.userUniqueInput.wallet || undefined,
          },
        }).nodeOperator();
      },
    });

    t.field("nodeOperatorByValidator", {
      type: "NodeOperator",
      args: {
        validatorUniqueInput: nonNull(
          arg({
            type: "ValidatorUniqueInput",
          })
        ),
      },
      resolve: (_parent, args, context) => {
        return context.prisma.Validator.findUnique({
          where: {
            pubKey: args.validatorUniqueInput.pubKey || undefined,
          },
        }).nodeOperator();
      },
    });

    t.list.field("depositDatasByValidator", {
      type: "DepositData",
      args: {
        validatorUniqueInput: nonNull(
          arg({
            type: "ValidatorUniqueInput",
          })
        ),
        amount: stringArg(),
      },
      resolve: (_parent, args, context) => {
        return context.prisma.Validator.findUnique({
          where: {
            pubKey: args.validatorUniqueInput.pubKey || undefined,
          },
        }).depositDatas({
          where: {
            amount: args.amount || undefined,
          },
        });
      },
    });

    t.list.field("validatorsByNodeOperator", {
      type: "Validator",
      args: {
        nodeOperatorUniqueInput: nonNull(
          arg({
            type: "NodeOperatorUniqueInput",
          })
        ),
      },
      resolve: (_parent, args, context) => {
        return context.prisma.NodeOperator.findUnique({
          where: {
            id: args.nodeOperatorUniqueInput.id || undefined,
          },
        }).validators({
          include: {
            depositDatas: true,
          },
          where: {
            status: true,
          },
        });
      },
    });

    t.list.field("depositDatasByNodeOperator", {
      type: "DepositData",
      args: {
        nodeOperatorUniqueInput: nonNull(
          arg({
            type: "NodeOperatorUniqueInput",
          })
        ),
        amount: stringArg(),
      },
      resolve: async (_parent, args, context) => {
        if (args.amount % 1 !== 0)
          throw new Error("Stake value not multiple of Ether");
        const { amount, validatorAmounts } = await availableStakeAmount(
          args,
          context
        );

        if (amount.gt(0)) throw new Error("Not enough available validators");

        const depositDatas: any[] = [];
        for (let i = 0; i < validatorAmounts.length; i++) {
          depositDatas.push(
            context.prisma.DepositData.findUnique({
              where: {
                validatorAmount: {
                  validatorId: validatorAmounts[i].validatorId,
                  amount: validatorAmounts[i].amount,
                },
              },
              include: {
                validator: {
                  select: {
                    status: true,
                  },
                },
              },
            })
          );
        }
        return depositDatas;
      },
    });

    t.field("stakeAmountByNodeOperator", {
      type: "StakeAmountByNodeOperatorOutPut",
      args: {
        nodeOperatorUniqueInput: nonNull(
          arg({
            type: "NodeOperatorUniqueInput",
          })
        ),
      },
      resolve: async (_parent, args, context) => {
        const { totalAmount } = await availableStakeAmount(args, context);

        return { amount: ethers.utils.formatEther(totalAmount) };
      },
    });

    t.field("isTakenReferalCode", {
      type: "ReferralCodeStatusOutput",
      args: {
        referralCode: nonNull(arg({ type: "String" })),
      },
      resolve: async (_parent, args, context) => {
        const user = await context.prisma.User.findUnique({
          where: {
            referralCode: args.referralCode,
          },
        });

        return { status: !!user };
      },
    });
  },
});

const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.nonNull.field("uploadFile", {
      type: "String",
      args: {
        file: nonNull(arg({ type: "Upload" })),
      },
      resolve: async (_, { file }) => {
        try {
          const { file_name, filepath } = await saveFileToTmp(file);
          await ossClient.put(file_name, filepath);
          return file_name;
        } catch (e: any) {
          throw new Error(e);
        }
      },
    });

    t.nonNull.field("createNodeOperator", {
      type: "User",
      args: {
        data: nonNull(
          arg({
            type: "UserNodeOperatorCreateInput",
          })
        ),
        userSignatureInput: nonNull(
          arg({
            type: "UserSignatureInput",
          })
        ),
      },
      resolve: async (_, args: any, context: any) => {
        const signatureValidation = await SignatureValidation(args);
        if (!signatureValidation) {
          throw new Error(`Invalid Signature`);
        }

        const walletValidation = WalletValidation(args.data.wallet);
        if (!walletValidation) {
          throw new Error(`Invalid wallet address`);
        }

        const userOwnerValidation = await UserOwnerValidation(
          args.userSignatureInput,
          args.data.wallet
        );
        if (!userOwnerValidation) {
          throw new Error(`Invalid wallet or signature`);
        }

        const nodeOperatorRateValidation = await NodeOperatorRateValidation(
          args
        );
        if (!nodeOperatorRateValidation) {
          throw new Error(
            `Invalid Node Operator rate: rate should be between 0 and 10`
          );
        }

        /* eslint-disable @typescript-eslint/no-unused-vars */
        const { rate, ...operatorWithoutRate } = args.data.nodeOperator;

        const apiKey = await generateUserApiKey(context, args.data.wallet);

        return context.prisma.User.upsert({
          where: { wallet: args.data.wallet },
          update: {
            wallet: args.data.wallet,
            apiKey: apiKey,
            nodeOperator: {
              upsert: {
                create: args.data.nodeOperator,
                update: operatorWithoutRate,
              },
            },
          },
          create: {
            wallet: args.data.wallet,
            apiKey: apiKey,
            nodeOperator: {
              create: args.data.nodeOperator,
            },
          },
          include: {
            nodeOperator: true,
          },
        });
      },
    });

    t.nonNull.field("createOrUpdateUser", {
      type: "User",
      args: {
        data: nonNull(
          arg({
            type: "CreateOrUpdateUserInput",
          })
        ),
        userSignatureInput: nonNull(
          arg({
            type: "UserSignatureInput",
          })
        ),
      },
      resolve: async (_, args, context) => {
        const signatureValidation = await SignatureValidation(args);
        if (!signatureValidation) {
          throw new Error(`Invalid Signature`);
        }

        const walletValidation = WalletValidation(args.data.wallet);
        if (!walletValidation) {
          throw new Error(`Invalid wallet address`);
        }

        const userOwnerValidation = await UserOwnerValidation(
          args.userSignatureInput,
          args.data.wallet
        );
        if (!userOwnerValidation) {
          throw new Error(`Invalid wallet or signature`);
        }

        if (
          args.data.referralCode.length < 4 ||
          args.data.referralCode.length > 16
        ) {
          throw new Error(`Referral code length should be between 4 and 16`);
        }

        const apiKey = await generateUserApiKey(context, args.data.wallet);

        return context.prisma.User.upsert({
          where: { wallet: args.data.wallet },
          update: {
            wallet: args.data.wallet,
            referralCode: args.data.referralCode,
            apiKey: apiKey,
          },
          create: {
            wallet: args.data.wallet,
            referralCode: args.data.referralCode,
            apiKey: apiKey,
          },
        });
      },
    });

    t.nonNull.field("referralByUser", {
      type: "Faucet",
      args: {
        data: nonNull(
          arg({
            type: "ReferralCreateInput",
          })
        ),
        userSignatureInput: nonNull(
          arg({
            type: "UserSignatureInput",
          })
        ),
      },
      resolve: async (_, args, context) => {
        const signatureValidation = await SignatureValidation(args);
        if (!signatureValidation) {
          throw new Error(`Invalid Signature`);
        }

        const walletValidation = WalletValidation(args.data.wallet);
        if (!walletValidation) {
          throw new Error(`Invalid wallet address`);
        }

        const discordIdAuthorization = await DiscordIdAuthorization(
          args.data.code,
          context.origin,
          context.chainid
        );
        if (!discordIdAuthorization) {
          throw new Error(`You are not Swell Network member`);
        }

        const { provider } = await getWeb3(context.chainid || "1");
        if ((await provider.getCode(args.data.wallet)) !== "0x") {
          throw new Error(`Contract address is not supported`);
        }

        const faucetReferrals = await context.prisma.Faucet.findMany({
          where: {
            discordId: discordIdAuthorization,
          },
        });
        if (faucetReferrals.length >= 3) {
          throw new Error(`This user already created 3 faucet referrals`);
        }

        return context.prisma.Faucet.create({
          data: {
            discordId: discordIdAuthorization,
            wallet: args.data.wallet,
            referee: {
              connect: {
                wallet: args.userSignatureInput.wallet,
              },
            },
          },
        });
      },
    });

    t.nonNull.field("nonceByUser", {
      type: "NonceOutput",
      args: {
        data: nonNull(
          arg({
            type: "UserUniqueInput",
          })
        ),
      },
      resolve: (_, args) => {
        const walletValidation = WalletValidation(args.data.wallet);
        if (!walletValidation) {
          throw new Error(`Invalid wallet address`);
        }
        const timestamp = new Date().getTime();
        const nonce = Math.floor(Math.random() * 1000000);
        nonceCache.put(`${args.data.wallet}-${timestamp}`, nonce, 300000);
        return { wallet: args.data.wallet, timestamp, nonce };
      },
    });

    t.nonNull.field("createDepositDataByValidatorFromJson", {
      type: "Validator",
      args: {
        nodeOperatorUniqueInput: nonNull(
          arg({
            type: "NodeOperatorUniqueInput",
          })
        ),
        depositDataCreateWithJsonInput: nonNull(
          arg({
            type: "DepositDataCreateWithJsonInput",
          })
        ),
        userSignatureInput: nonNull(
          arg({
            type: "UserSignatureInput",
          })
        ),
      },
      resolve: async (_, args, context) => {
        const signatureValidation = await SignatureValidation(args);
        if (!signatureValidation) {
          throw new Error(`Invalid Signature`);
        }

        const nodeOperatorOwnerValidation = await NodeOperatorOwnerValidation(
          args,
          context
        );
        if (!nodeOperatorOwnerValidation) {
          throw new Error(`Wallet is not the owner of node operator`);
        }

        const res = await createDepositData(
          context.prisma,
          context.chainid,
          context.contract.address,
          args.depositDataCreateWithJsonInput,
          args.nodeOperatorUniqueInput
        );
        return res;
      },
    });
  },
});

const NonceOutput = objectType({
  name: "NonceOutput",
  definition(t) {
    t.nonNull.string("wallet");
    t.nonNull.int("nonce");
    t.nonNull.string("timestamp");
  },
});

const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("wallet");
    t.nonNull.string("role");
    t.field("nodeOperator", {
      type: "NodeOperator",
      resolve: (parent, _, context) => {
        return context.prisma.User.findUnique({
          where: { id: parent.id || undefined },
        }).nodeOperator();
      },
    });
    t.string("referralCode");
    t.string("apiKey");
  },
});

const Faucet = objectType({
  name: "Faucet",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("discordId");
    t.nonNull.string("wallet");
    t.nonNull.field("referee", {
      type: "User",
      resolve: (parent, _, context) => {
        return context.prisma.User.findUnique({
          where: { id: parent.userId || undefined },
        });
      },
    });
    t.string("txHash");
  },
});

const NodeOperator = objectType({
  name: "NodeOperator",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });
    t.nonNull.string("name");
    t.nonNull.string("category");
    t.nonNull.string("location");
    t.string("executionLayerClients");
    t.string("consensusLayerClients");
    t.nonNull.int("yearsOfExperience");
    t.nonNull.int("cpu");
    t.nonNull.int("ram");
    t.nonNull.int("network");
    t.nonNull.int("storage");
    t.nonNull.int("nodes");
    t.nonNull.boolean("status");
    t.string("description");
    t.string("website");
    t.string("social");
    t.string("email");
    t.list.field("validators", {
      type: "Validator",
      resolve: (parent, _, context) => {
        return context.prisma.NodeOperator.findUnique({
          where: { id: parent.id || undefined },
        }).validators();
      },
    });
    t.nonNull.field("user", {
      type: "User",
      resolve: (parent, _, context) => {
        return context.prisma.User.findUnique({
          where: { id: parent.userId || undefined },
        });
      },
    });
    t.nonNull.int("rate");
    t.nonNull.boolean("verified");
    t.string("logo");
  },
});

const Validator = objectType({
  name: "Validator",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });
    t.nonNull.string("pubKey");
    t.nonNull.boolean("status");
    t.list.nonNull.field("depositDatas", {
      type: "DepositData",
      resolve: (parent, _, context) => {
        return context.prisma.Validator.findUnique({
          where: { id: parent.id || undefined },
        }).depositDatas();
      },
    });
    t.nonNull.field("nodeOperator", {
      type: "NodeOperator",
      resolve: (parent, _, context) => {
        return context.prisma.NodeOperator.findUnique({
          where: { id: parent.nodeOperatorId || undefined },
        });
      },
    });
    t.int("index");
    t.string("balance");
    t.string("state");
    t.string("withdrawal_credentials");
    t.string("effective_balance");
    t.boolean("slashed");
    t.string("activation_eligibility_epoch");
    t.string("activation_epoch");
    t.string("exit_epoch");
    t.string("withdrawable_epoch");
    t.string("depositBalance");
  },
});

const DepositData = objectType({
  name: "DepositData",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });
    t.nonNull.string("amount");
    t.nonNull.string("signature");
    t.nonNull.string("depositDataRoot");
    t.nonNull.field("validator", {
      type: "Validator",
      resolve: (parent, _, context) => {
        return context.prisma.Validator.findUnique({
          where: { id: parent.validatorId || undefined },
        });
      },
    });
  },
});

const UserUniqueInput = inputObjectType({
  name: "UserUniqueInput",
  definition(t) {
    t.nonNull.string("wallet");
  },
});

const NodeOperatorUniqueInput = inputObjectType({
  name: "NodeOperatorUniqueInput",
  definition(t) {
    t.nonNull.int("id");
  },
});

const ValidatorUniqueInput = inputObjectType({
  name: "ValidatorUniqueInput",
  definition(t) {
    t.nonNull.string("pubKey");
  },
});

const DepositDataUniqueInput = inputObjectType({
  name: "DepositDataUniqueInput",
  definition(t) {
    t.nonNull.string("amount");
  },
});

const NodeOperatorCreateInput = inputObjectType({
  name: "NodeOperatorCreateInput",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.string("category");
    t.nonNull.string("location");
    t.nonNull.int("cpu");
    t.nonNull.int("ram");
    t.nonNull.int("network");
    t.nonNull.int("storage");
    t.string("executionLayerClients");
    t.string("consensusLayerClients");
    t.nonNull.int("nodes");
    t.nonNull.int("yearsOfExperience");
    t.nonNull.string("description");
    t.string("website");
    t.string("social");
    t.string("email");
    t.nonNull.int("rate");
    t.string("logo");
  },
});

const DepositDataCreateInput = inputObjectType({
  name: "DepositDataCreateInput",
  definition(t) {
    t.nonNull.string("signature");
    t.nonNull.string("depositDataRoot");
    t.nonNull.string("amount");
  },
});

const DepositDataCreateWithJsonInput = inputObjectType({
  name: "DepositDataCreateWithJsonInput",
  definition(t) {
    t.nonNull.string("data");
    t.nonNull.string("pubKey");
  },
});

const UserNodeOperatorCreateInput = inputObjectType({
  name: "UserNodeOperatorCreateInput",
  definition(t) {
    t.nonNull.string("wallet");
    t.nonNull.field("nodeOperator", { type: "NodeOperatorCreateInput" });
  },
});

const CreateOrUpdateUserInput = inputObjectType({
  name: "CreateOrUpdateUserInput",
  definition(t) {
    t.nonNull.string("wallet");
    t.nonNull.string("referralCode");
  },
});

const UserSignatureInput = inputObjectType({
  name: "UserSignatureInput",
  definition(t) {
    t.nonNull.string("wallet");
    t.nonNull.string("signature");
    t.nonNull.string("timestamp");
  },
});

const ValidatorCreateInput = inputObjectType({
  name: "ValidatorCreateInput",
  definition(t) {
    t.nonNull.string("pubKey");
    t.nonNull.int("nodeOperatorId");
    t.list.nonNull.field("depositDatas", { type: "DepositDataCreateInput" });
  },
});

const ReferralCreateInput = inputObjectType({
  name: "ReferralCreateInput",
  definition(t) {
    t.nonNull.string("code");
    t.nonNull.string("wallet");
  },
});

const StakeAmountByNodeOperatorOutPut = objectType({
  name: "StakeAmountByNodeOperatorOutPut",
  definition(t) {
    t.nonNull.string("amount");
  },
});

const ReferralCodeStatusOutput = objectType({
  name: "ReferralCodeStatusOutput",
  definition(t) {
    t.nonNull.boolean("status");
  },
});

const schema = makeSchema({
  types: [
    Query,
    Mutation,
    NodeOperator,
    User,
    NonceOutput,
    Faucet,
    Validator,
    DepositData,
    UserUniqueInput,
    UserNodeOperatorCreateInput,
    CreateOrUpdateUserInput,
    UserSignatureInput,
    NodeOperatorCreateInput,
    ValidatorCreateInput,
    DepositDataCreateInput,
    DepositDataCreateWithJsonInput,
    NodeOperatorUniqueInput,
    ValidatorUniqueInput,
    ReferralCreateInput,
    DepositDataUniqueInput,
    DateTime,
    StakeAmountByNodeOperatorOutPut,
    ReferralCodeStatusOutput,
    Upload,
  ],
  outputs: {
    schema: __dirname + "/schema.graphql",
  },
  sourceTypes: {
    modules: [
      {
        module: "@prisma/client",
        alias: "prisma",
      },
    ],
  },
});

export { schema };
