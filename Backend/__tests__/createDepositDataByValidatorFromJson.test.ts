import { ethers } from "ethers";

import { server } from "../app";
import { CREATE_DEPOSIT_DATA_BY_VALIDATOR_FROM_JSON } from "../shared/graphql";
import { validateDepositData } from "../utils/createDepositData";
import invalidDepositdata from "./misc/invalidDepositdata.json";
import validDepositdata from "./misc/validDepositdata.json";
import invalidAmountDepositdata from "./misc/invalidAmountDepositdata.json";
import {
  createNodeOperator,
  deleteAll,
  getNodeOperatorByUserId,
  getSignature,
} from "./utils/index";

const USE_DOCKER = true;

const testServer = server;
const testAccount = ethers.Wallet.createRandom();
const testAccount1 = ethers.Wallet.createRandom();

let validDepositJsonData: any;
let validPubKey: any;
let validNodeOperator: any;
let validNodeOperator1: any;

let invalidDepositJsonData: any;
let invalidAmountDepositJsonData: any;

jest.setTimeout(70000);

beforeAll(async () => {
  await deleteAll();

  const userData = await createNodeOperator(testAccount);
  const userData1 = await createNodeOperator(testAccount1);
  validNodeOperator = await getNodeOperatorByUserId(userData.id);
  validNodeOperator1 = await getNodeOperatorByUserId(userData1.id);

  // valid data
  validDepositJsonData = JSON.stringify(validDepositdata);
  validPubKey =
    "0x8e1d21c1e453436b107bbaf2e4d38350da87034e06a1c4931f234dd707ab71b1d1189e009ebd7f33c8d69f4914922dc9";

  // invalid data
  invalidDepositJsonData = JSON.stringify(invalidDepositdata);
  invalidAmountDepositJsonData = JSON.stringify(invalidAmountDepositdata);
});

describe("createDepositDataByValidatorFromJson Mutation API test", () => {
  test("(1) should be reverted when signature is invalid", async () => {
    // prepare mutation variables
    const nodeOperatorUniqueInput = {
      id: validNodeOperator.id,
    };
    const depositDataCreateWithJsonInput = {
      data: validDepositJsonData,
      pubKey: validPubKey,
    };
    const userSignatureInput = await getSignature(testAccount);
    const invalidSignature = await testAccount.signMessage(
      `I am signing my one-time nonce: 10000`
    );
    const invalidUserSignatureInput = {
      ...userSignatureInput,
      signature: invalidSignature,
    };

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_DEPOSIT_DATA_BY_VALIDATOR_FROM_JSON,
      variables: {
        nodeOperatorUniqueInput,
        depositDataCreateWithJsonInput,
        userSignatureInput: invalidUserSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual("Invalid Signature");
  });

  test("(2) should be reverted when caller is not the owner of node operator", async () => {
    // prepare mutation variables
    const nodeOperatorUniqueInput = {
      id: validNodeOperator.id,
    };
    const depositDataCreateWithJsonInput = {
      data: validDepositJsonData,
      pubKey: validPubKey,
    };
    const userSignatureInput = await getSignature(ethers.Wallet.createRandom());

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_DEPOSIT_DATA_BY_VALIDATOR_FROM_JSON,
      variables: {
        nodeOperatorUniqueInput,
        depositDataCreateWithJsonInput,
        userSignatureInput,
      },
    });
    expect(res.errors[0].message).toEqual(
      "Wallet is not the owner of node operator"
    );
  });

  test("(3) should be reverted when amount is invalid", async () => {
    // prepare mutation variables
    const nodeOperatorUniqueInput = {
      id: validNodeOperator.id,
    };
    const depositDataCreateWithJsonInput = {
      data: invalidAmountDepositJsonData,
      pubKey: validPubKey,
    };
    const userSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_DEPOSIT_DATA_BY_VALIDATOR_FROM_JSON,
      variables: {
        nodeOperatorUniqueInput,
        depositDataCreateWithJsonInput,
        userSignatureInput,
      },
    });
    expect(res.errors[0].message).toEqual("Amount not valid");
  });

  test("(4) should be reverted when pubKey in JSON data is invalid", async () => {
    // prepare mutation variables
    const nodeOperatorUniqueInput = {
      id: validNodeOperator.id,
    };
    const depositDataCreateWithJsonInput = {
      data: invalidDepositJsonData,
      pubKey: validPubKey,
    };
    const userSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_DEPOSIT_DATA_BY_VALIDATOR_FROM_JSON,
      variables: {
        nodeOperatorUniqueInput,
        depositDataCreateWithJsonInput,
        userSignatureInput,
      },
    });
    expect(res.errors[0].message).toEqual("Deposit data verification error");
  });

  test("(5) should be succeeded when all info is correct", async () => {
    // prepare mutation variables
    const nodeOperatorUniqueInput = {
      id: validNodeOperator.id,
    };
    const depositDataCreateWithJsonInput = {
      data: validDepositJsonData,
      pubKey: validPubKey,
    };
    const userSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_DEPOSIT_DATA_BY_VALIDATOR_FROM_JSON,
      variables: {
        nodeOperatorUniqueInput,
        depositDataCreateWithJsonInput,
        userSignatureInput,
      },
    });
    expect(res.data.createDepositDataByValidatorFromJson.pubKey).toEqual(
      depositDataCreateWithJsonInput.pubKey
    );
  });

  test("(6) should be reverted when validator pubkey was already taken in anotehr node operator", async () => {
    // prepare mutation variables
    const nodeOperatorUniqueInput = {
      id: validNodeOperator1.id,
    };
    const depositDataCreateWithJsonInput = {
      data: validDepositJsonData,
      pubKey: validPubKey,
    };
    const userSignatureInput = await getSignature(testAccount1);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_DEPOSIT_DATA_BY_VALIDATOR_FROM_JSON,
      variables: {
        nodeOperatorUniqueInput,
        depositDataCreateWithJsonInput,
        userSignatureInput,
      },
    });
    expect(res.errors[0].message).toEqual(
      "Validator pubkey was already taken in another node operator"
    );
  });
});

describe("No 0x regression tests", () => {
  const validAmount = "1";
  const correctChainId = "1";
  const validKey =
    "0x8e1d21c1e453436b107bbaf2e4d38350da87034e06a1c4931f234dd707ab71b1d1189e009ebd7f33c8d69f4914922dc9";
  const HEAD_validKey =
    "8e1d21c1e453436b107bbaf2e4d38350da87034e06a1c4931f234dd707ab71b1d1189e009ebd7f33c8d69f4914922dc8";
  const validAddress = "0x0Be0fE93885bDc2C8459f04EdC0Df2e285b8d6DB";
  const HEAD_validAddress = "0Be0fE93885bDc2C8459f04EdC0Df2e285b8d6D0";
  const HEAD_pubkey =
    "8e1d21c1e453436b107bbaf2e4d38350da87034e06a1c4931f234dd707ab71b1d1189e009ebd7f33c8d69f4914922dc9";
  const HEAD_withdrawal_credentials =
    "0100000000000000000000000be0fe93885bdc2c8459f04edc0df2e285b8d6db";
  const HEAD_signature =
    "88e683dcbce79f13c39456fedb166a6b7c6e8b348a76a3e706d1f3c5ee9fa896e69494386253b68925b3ccf796dd7e7e12c5d83fa1bfd64c4f870eec4f6f8e245b4237b7e63a62914e4c7470581c1ad1311ef60acf2e71d2edc5552861098df6";

  const HEAD_deposit_data_root =
    "8906cea3427fb10639419318d4901b507af9ab74d689140b3c432f0974dd6c21";
  const HEAD_deposit_message_root =
    "89bbf641e373b7d917837d45ea2aabf63667d2fc2dcc49421ff2bf32eb18cc7b";

  test("Known expected pass", async () => {
    await validateDepositData(
      correctChainId,
      validDepositdata,
      validKey,
      validAddress,
      validAmount,
      USE_DOCKER
    );
  });

  test("Key without 0x should fail", async () => {
    await expect(
      validateDepositData(
        correctChainId,
        validDepositdata,
        HEAD_validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  test("Address without 0x should fail", async () => {
    await expect(
      validateDepositData(
        correctChainId,
        validDepositdata,
        validKey,
        HEAD_validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  test("Pubkey without 0x should fail", async () => {
    await expect(
      validateDepositData(
        correctChainId,
        Object.assign({}, validDepositdata, {
          pubkey: HEAD_pubkey,
        }),
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Invalid pubkey");
  });

  test("Withdrawal Creds without 0x should fail", async () => {
    await expect(
      validateDepositData(
        correctChainId,
        Object.assign({}, validDepositdata, {
          withdrawal_credentials: HEAD_withdrawal_credentials,
        }),
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Invalid withdrawal_credentials");
  });

  test("Signature without 0x should fail", async () => {
    await expect(
      validateDepositData(
        correctChainId,
        Object.assign({}, validDepositdata, {
          signature: HEAD_signature,
        }),
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Invalid signature");
  });

  test("Desposit Data Root without 0x should fail", async () => {
    await expect(
      validateDepositData(
        correctChainId,
        Object.assign({}, validDepositdata, {
          deposit_data_root: HEAD_deposit_data_root,
        }),
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Invalid deposit_data_root");
  });

  test("Deposit Message Root without 0x should fail", async () => {
    await expect(
      validateDepositData(
        correctChainId,
        Object.assign({}, validDepositdata, {
          deposit_message_root: HEAD_deposit_message_root,
        }),
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Invalid deposit_message_root");
  });
});

describe("Isolated validateDepositData tests", () => {
  const correctChainId = "1";
  const invalidChainId = "5";
  const validKey =
    "0x8e1d21c1e453436b107bbaf2e4d38350da87034e06a1c4931f234dd707ab71b1d1189e009ebd7f33c8d69f4914922dc9";
  const invalidKey =
    "0x8e1d21c1e453436b107bbaf2e4d38350da87034e06a1c4931f234dd707ab71b1d1189e009ebd7f33c8d69f4914922dc8";
  const validAddress = "0x0Be0fE93885bDc2C8459f04EdC0Df2e285b8d6DB";
  const invalidAddress = "0x0Be0fE93885bDc2C8459f04EdC0Df2e285b8d6D0";
  const validAmount = "1";
  const invalidAmount = "10";

  test("Known expected pass", async () => {
    await validateDepositData(
      correctChainId,
      validDepositdata,
      validKey,
      validAddress,
      validAmount,
      USE_DOCKER
    );
  });

  test("Fail on modify signature", async () => {
    await expect(
      validateDepositData(
        correctChainId,
        validDepositdata,
        invalidKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  test("Fail on wrong chain", async () => {
    await expect(
      validateDepositData(
        invalidChainId,
        validDepositdata,
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  test("Fail on modified address", async () => {
    await expect(
      validateDepositData(
        correctChainId,
        validDepositdata,
        validKey,
        invalidAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  test("Fail on wrong amount", async () => {
    await expect(
      validateDepositData(
        correctChainId,
        validDepositdata,
        validKey,
        validAddress,
        invalidAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  test("Fail on modified JSON - signature", async () => {
    // Modified signature
    await expect(
      validateDepositData(
        correctChainId,
        Object.assign({}, validDepositdata, {
          signature:
            "0x88e683dcbce79f13c39456fedb166a6b7c6e8b348a76a3e706d1f3c5ee9fa896e69494386253b68925b3ccf796dd7e7e12c5d83fa1bfd64c4f870eec4f6f8e245b4237b7e63a62914e4c7470581c1ad1311ef60acf2e71d2edc5552861098df5",
        }),
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  test("Fail on modified JSON - pub key", async () => {
    // Modified signature
    await expect(
      validateDepositData(
        correctChainId,
        Object.assign({}, validDepositdata, {
          pubkey: invalidKey,
        }),
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  test("Fail on modified JSON - withdrawal", async () => {
    // Modified signature
    await expect(
      validateDepositData(
        correctChainId,
        Object.assign({}, validDepositdata, {
          withdrawal_credentials:
            "0x0100000000000000000000000be0fe93885bdc2c8459f04edc0df2e285b8d6d0",
        }),
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  test("Fail on modified JSON - amount", async () => {
    // Modified signature
    await expect(
      validateDepositData(
        correctChainId,
        Object.assign({}, validDepositdata, {
          amount: 2000000000,
        }),
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  test("Fail on modified JSON - deposit_data_root", async () => {
    // Modified signature
    await expect(
      validateDepositData(
        correctChainId,
        Object.assign({}, validDepositdata, {
          deposit_data_root:
            "0x8906cea3427fb10639419318d4901b507af9ab74d689140b3c432f0974dd6c20",
        }),
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  // Ignore this test for now as there is an issue with ethdo
  // test("Fail on modified JSON - deposit_message_root", async () => {
  //   // Modified signature
  //   await expect(
  //     validateDepositData(
  //       correctChainId,
  //       Object.assign({}, validDepositdata, {
  //         deposit_message_root:
  //           "0x89bbf641e373b7d917837d45ea2aabf63667d2fc2dcc49421ff2bf32eb18cc00",
  //       }),
  //       validKey,
  //       validAddress,
  //       validAmount,
  //       USE_DOCKER
  //     )
  //   ).rejects.toThrow("Deposit data verification error");
  // });

  test("Fail on modified JSON - fork_version", async () => {
    // Modified signature
    await expect(
      validateDepositData(
        correctChainId,
        Object.assign({}, validDepositdata, {
          fork_version: "0x00000001",
        }),
        validKey,
        validAddress,
        validAmount,
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });

  test("Distributed wallet should fail", async () => {
    const pubkey =
      "0x8fb8c2b026eeea38d29cc86b174dd00b00867ec0d44846e69048d06b8c68a15308a101a45c4e4f9ed2b788315558cbe6";
    const swellAddress = "0x23e33FC2704Bb332C0410B006e8016E7B99CF70A";
    await expect(
      validateDepositData(
        "5",
        {
          name: "Deposit for DistributedWallet/val-1",
          account: "DistributedWallet/val-1",
          pubkey,
          withdrawal_credentials:
            "0x01000000000000000000000023e33fc2704bb332c0410b006e8016e7b99cf70a",
          signature:
            "0xa86bc45816cae6cc453a70895919ce69681f0c392e2c09b16f94e9c81f6caecb05b6d7389c11d07563973a4553cc6dac0ccce28e80617014b3aeb433024a82a501e6a0045d78cbc7912039f46de0ee489c48bc395902642d3318e8baddd0a8a4",
          amount: 1000000000,
          deposit_data_root:
            "0x3099a74ec44ad1ef89df32b7686d13e8a8d297491e82791a7e8173a5f5fd2553",
          deposit_message_root:
            "0x4968c064e98ba7a21a7c78c8339fe228694b0a936bedd7d11f016cf749c243fd",
          fork_version: "0x00001020",
          version: 3,
        },
        pubkey,
        swellAddress,
        "1",
        USE_DOCKER
      )
    ).rejects.toThrow("Deposit data verification error");
  });
});
