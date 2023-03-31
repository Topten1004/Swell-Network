import { ethers } from "ethers";

import { server } from "../app";
import { GET_NONCE_BY_USER } from "../shared/graphql";
import { createNodeOperator, deleteAll } from "./utils/index";

const testServer = server;
const testAccount = ethers.Wallet.createRandom();

let validWallet: any;
let invalidWallet: any;

jest.setTimeout(70000);

beforeAll(async () => {
  await deleteAll();

  await createNodeOperator(testAccount);
  validWallet = testAccount.address;
  invalidWallet = "0x61B2E3aC6E5d7712537ed0909eed1ee838b410D355";
});

describe("nonceByUser Mutation API test", () => {
  test("(1) should be reverted when wallet address is invalid", async () => {
    // prepare mutation variables
    const res: any = await testServer.executeOperation({
      query: GET_NONCE_BY_USER,
      variables: {
        userUniqueInput: {
          wallet: invalidWallet,
        },
      },
    });

    expect(res.errors[0].message).toEqual("Invalid wallet address");
  });

  test("(2) should be succeeded when wallet address is valid", async () => {
    // prepare mutation variables
    const res: any = await testServer.executeOperation({
      query: GET_NONCE_BY_USER,
      variables: {
        userUniqueInput: {
          wallet: validWallet,
        },
      },
    });

    expect(res.data.nonceByUser.wallet).toEqual(validWallet);
    expect(res.data.nonceByUser.timestamp).not.toBeNull();
    expect(res.data.nonceByUser.nonce).not.toBeNull();
  });

  test("(3) should be succeeded with different nonce", async () => {
    // generate first nonce
    const res1: any = await testServer.executeOperation({
      query: GET_NONCE_BY_USER,
      variables: {
        userUniqueInput: {
          wallet: validWallet,
        },
      },
    });
    const nonce1 = res1.data.nonceByUser.nonce;
    // generate second nonce
    const res2: any = await testServer.executeOperation({
      query: GET_NONCE_BY_USER,
      variables: {
        userUniqueInput: {
          wallet: validWallet,
        },
      },
    });
    const nonce2 = res2.data.nonceByUser.nonce;

    expect(nonce1).not.toEqual(nonce2);
  });
});
