import { ethers } from "ethers";

import { server } from "../app";
import { CREATE_NODE_OPERATOR } from "../shared/graphql";
import { nodeOperatorCreateInput } from "./utils/constants";
import { deleteAll, getSignature } from "./utils/index";

jest.setTimeout(70000);

const testServer = server;
const testAccount = ethers.Wallet.createRandom();
const testAccount1 = ethers.Wallet.createRandom();

beforeAll(async () => {
  await deleteAll();
});

describe("createNodeOperator Mutation API test", () => {
  test("(1) should be reverted when signature is invalid", async () => {
    // prepare mutation variables
    const userNodeOperatorCreateInput = {
      wallet: testAccount.address,
      nodeOperator: nodeOperatorCreateInput,
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
      query: CREATE_NODE_OPERATOR,
      variables: {
        userNodeOperatorCreateInput: userNodeOperatorCreateInput,
        userSignatureInput: invalidUserSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual("Invalid Signature");
  });

  test("(2) should be reverted when wallet address is invalid", async () => {
    // prepare mutation variables
    const invalidUserNodeOperatorCreateInput = {
      wallet: "Invalid wallet address",
      nodeOperator: nodeOperatorCreateInput,
    };
    const validUserSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_NODE_OPERATOR,
      variables: {
        userNodeOperatorCreateInput: invalidUserNodeOperatorCreateInput,
        userSignatureInput: validUserSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual("Invalid wallet address");
  });

  test("(3) should be reverted when userNodeOperatorCreateInput is invalid", async () => {
    // prepare mutation variables
    const invalidUserNodeOperatorCreateInput = {
      wallet: testAccount.address,
      nodeOperator: { ...nodeOperatorCreateInput, rate: 11 }, // invalid rate
    };
    const validUserSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_NODE_OPERATOR,
      variables: {
        userNodeOperatorCreateInput: invalidUserNodeOperatorCreateInput,
        userSignatureInput: validUserSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual(
      "Invalid Node Operator rate: rate should be between 0 and 10"
    );
  });

  test("(4) should be reverted when wallet and signature wallet is not matched", async () => {
    // prepare mutation variables
    const invalidUserNodeOperatorCreateInput = {
      wallet: testAccount1.address,
      nodeOperator: nodeOperatorCreateInput,
    };
    const validUserSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_NODE_OPERATOR,
      variables: {
        userNodeOperatorCreateInput: invalidUserNodeOperatorCreateInput,
        userSignatureInput: validUserSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual("Invalid wallet or signature");
  });

  test("(5) should be succeeded when userNodeOperatorCreateInput is valid", async () => {
    // prepare mutation variables
    const validUserNodeOperatorCreateInput = {
      wallet: testAccount.address,
      nodeOperator: nodeOperatorCreateInput,
    };
    const validUserSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_NODE_OPERATOR,
      variables: {
        userNodeOperatorCreateInput: validUserNodeOperatorCreateInput,
        userSignatureInput: validUserSignatureInput,
      },
    });

    expect(res.data.createNodeOperator.wallet).toEqual(testAccount.address);
    expect(res.data.createNodeOperator.role).toEqual("USER");
  });
});
