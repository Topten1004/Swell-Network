import { ethers } from "ethers";

import { server } from "../app";
import { CREATE_OR_UPDATE_USER } from "../shared/graphql";
import { deleteAll, getSignature } from "./utils/index";

jest.setTimeout(70000);

const testServer = server;
const testAccount = ethers.Wallet.createRandom();
const testAccount1 = ethers.Wallet.createRandom();
const validReferralCode = "testReferaCode1";

beforeAll(async () => {
  await deleteAll();
});

describe("createOrUpdateUser Mutation API test", () => {
  test("(1) should be reverted when signature is invalid", async () => {
    // prepare mutation variables
    const createOrUpdateUserInput = {
      wallet: testAccount.address,
      referralCode: validReferralCode,
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
      query: CREATE_OR_UPDATE_USER,
      variables: {
        createOrUpdateUserInput: createOrUpdateUserInput,
        userSignatureInput: invalidUserSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual("Invalid Signature");
  });

  test("(2) should be reverted when wallet address is invalid", async () => {
    // prepare mutation variables
    const invalidReferralCodeCreateInput = {
      wallet: "Invalid wallet address",
      referralCode: validReferralCode,
    };
    const validUserSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_OR_UPDATE_USER,
      variables: {
        createOrUpdateUserInput: invalidReferralCodeCreateInput,
        userSignatureInput: validUserSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual("Invalid wallet address");
  });

  test("(3) should be reverted when referral code length is smaller than 4", async () => {
    // prepare mutation variables
    const validReferralCodeCreateInput = {
      wallet: testAccount.address,
      referralCode: "AAA", // length of referral code is 3
    };
    const validUserSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_OR_UPDATE_USER,
      variables: {
        createOrUpdateUserInput: validReferralCodeCreateInput,
        userSignatureInput: validUserSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual(
      "Referral code length should be between 4 and 16"
    );
  });

  test("(4) should be reverted when referral code length is greater than 16", async () => {
    // prepare mutation variables
    const validReferralCodeCreateInput = {
      wallet: testAccount.address,
      referralCode: "AAAAAAAAAAAAAAAAA", // length of referral code is 17
    };
    const validUserSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_OR_UPDATE_USER,
      variables: {
        createOrUpdateUserInput: validReferralCodeCreateInput,
        userSignatureInput: validUserSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual(
      "Referral code length should be between 4 and 16"
    );
  });

  test("(5) should be reverted when createOrUpdateUserInput and userSignatureInput is valid", async () => {
    // prepare mutation variables
    const referralCodeCreateInput = {
      wallet: testAccount1.address,
      referralCode: validReferralCode,
    };
    const validUserSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_OR_UPDATE_USER,
      variables: {
        createOrUpdateUserInput: referralCodeCreateInput,
        userSignatureInput: validUserSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual("Invalid wallet or signature");
  });

  test("(6) should be succeeded when wallet and userSignatureInput wallet is not matched", async () => {
    // prepare mutation variables
    const validReferralCodeCreateInput = {
      wallet: testAccount.address,
      referralCode: validReferralCode,
    };
    const validUserSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: CREATE_OR_UPDATE_USER,
      variables: {
        createOrUpdateUserInput: validReferralCodeCreateInput,
        userSignatureInput: validUserSignatureInput,
      },
    });

    expect(res.data.createOrUpdateUser.wallet).toEqual(testAccount.address);
    expect(res.data.createOrUpdateUser.referralCode).toEqual(validReferralCode);
    expect(res.data.createOrUpdateUser.role).toEqual("USER");
  });
});
