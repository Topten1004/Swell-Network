import axios from "axios";
import { ethers } from "ethers";

import { server } from "../app";
import { REFERRAL_BY_USER } from "../shared/graphql";
import { createNodeOperator, deleteAll, getSignature } from "./utils/index";

const DISCORD_OAUTH2_TOKEN_API_URL = `${process.env["DISCORD_API_URL"]}/oauth2/token`;
const DISCORD_GUILD_MEMBER_API_URL = `${process.env["DISCORD_API_URL"]}/users/@me/guilds/907097149521678357/member`;

jest.mock("axios");
jest.setTimeout(70000);
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockAxios = () => {
  // mock discord guild member API
  mockedAxios.get.mockImplementation((url: string) => {
    if (url === DISCORD_GUILD_MEMBER_API_URL) {
      return Promise.resolve({
        status: 200,
        data: {
          user: {
            username: "Optisman",
            discriminator: "9737",
          },
        },
      });
    }
    return Promise.resolve({ status: 400, data: { test: "test" } });
  });

  // mock discord oauth2 token api
  mockedAxios.post.mockImplementation((url: string, data: any) => {
    if (url === DISCORD_OAUTH2_TOKEN_API_URL) {
      if (data.get("code") === validReferralCode)
        return Promise.resolve({
          status: 200,
          data: { access_token: "mock_access_token" },
        });
      if (data.get("code") === invalidReferralCode)
        return Promise.resolve({ status: 400 });
    }
    return Promise.resolve({
      status: 400,
      data: { access_token: "mock_access_token" },
    });
  });
};

const validReferralCode = "Valid referral code";
const validTestReferralWallet = "0xB014CF62f1fbb53125f1f37687429AE82B403dB9";
const invalidReferralCode = "Invalid referral code";
const invalidTestReferralWallet =
  "0xB014CF62f1fbb53125f1f37687429AE82B403dB912";
const invalidContractTestReferralWallet =
  "0xd30998FbF6A969DE84a18392763016be7643A5d2";

const testServer = server;
const testAccount = ethers.Wallet.createRandom();

beforeAll(async () => {
  await deleteAll();

  mockAxios();
  await createNodeOperator(testAccount);
});

describe("referralByUser Mutation API test", () => {
  test("(1) should be reverted when signature is invalid", async () => {
    // prepare mutation variables
    const data = {
      code: validReferralCode,
      wallet: testAccount.address,
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
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput: invalidUserSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual("Invalid Signature");
  });

  test("(2) should be reverted when discord referral code is invalid", async () => {
    // prepare mutation variables
    const data = {
      code: invalidReferralCode,
      wallet: testAccount.address,
    };
    const userSignatureInput = await getSignature(testAccount);
    // call
    const res: any = await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual("You are not Swell Network member");
  });

  test("(3) should be reverted when 'wallet' of data is invalid", async () => {
    // prepare mutation variables
    const data = {
      code: validReferralCode,
      wallet: invalidTestReferralWallet,
    };
    const userSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual("Invalid wallet address");
  });

  test("(4) should be reverted when 'wallet' of data is contract address", async () => {
    // prepare mutation variables
    const data = {
      code: validReferralCode,
      wallet: invalidContractTestReferralWallet,
    };
    const userSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput,
      },
    });

    expect(res.errors[0].message).toEqual("Contract address is not supported");
  });

  test("(5) should be succeeded when 'wallet' of data is valid", async () => {
    // prepare mutation variables
    const data = {
      code: validReferralCode,
      wallet: validTestReferralWallet,
    };
    const userSignatureInput = await getSignature(testAccount);

    // call
    const res: any = await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput,
      },
    });

    expect(res.data.referralByUser.wallet).toEqual(validTestReferralWallet);
  });

  test("(6) should be reverted when referal wallet was already verified 3 times - from the same wallet", async () => {
    // prepare mutation variables
    const data = {
      code: validReferralCode,
      wallet: validTestReferralWallet,
    };

    // call
    await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput: await getSignature(testAccount),
      },
    });
    await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput: await getSignature(testAccount),
      },
    });
    await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput: await getSignature(testAccount),
      },
    });
    const res: any = await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput: await getSignature(testAccount),
      },
    });

    expect(res.errors[0].message).toEqual(
      "This user already created 3 faucet referrals"
    );
  });

  test("(6) should be reverted when referal wallet was already verified 3 times - from different wallets", async () => {
    // prepare mutation variables
    const data = {
      code: validReferralCode,
      wallet: validTestReferralWallet,
    };
    const data2 = {
      code: validReferralCode,
      wallet: testAccount.address,
    };

    // call
    await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput: await getSignature(testAccount),
      },
    });
    await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput: await getSignature(testAccount),
      },
    });
    await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data2,
        userSignatureInput: await getSignature(testAccount),
      },
    });
    const res: any = await testServer.executeOperation({
      query: REFERRAL_BY_USER,
      variables: {
        referralCreateInput: data,
        userSignatureInput: await getSignature(testAccount),
      },
    });

    expect(res.errors[0].message).toEqual(
      "This user already created 3 faucet referrals"
    );
  });
});
