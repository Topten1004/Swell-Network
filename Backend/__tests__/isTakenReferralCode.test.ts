import { ethers } from "ethers";

import { server } from "../app";
import {
  CREATE_OR_UPDATE_USER,
  IS_TAKEN_REFERRAL_CODE,
} from "../shared/graphql";
import { deleteAll, getSignature } from "./utils/index";

jest.setTimeout(70000);

const testServer = server;
const testAccount = ethers.Wallet.createRandom();
const referralCode1 = "non_existing_code";
const referralCode2 = "existing_code";

beforeAll(async () => {
  await deleteAll();
});

describe("isTakenReferralCode query API test", () => {
  test("(1) should return false for non-existing referral code", async () => {
    // call
    const res: any = await testServer.executeOperation({
      query: IS_TAKEN_REFERRAL_CODE,
      variables: {
        referralCode: referralCode1,
      },
    });

    expect(res.data.isTakenReferalCode.status).toEqual(false);
  });

  test("(2) should be reverted to get the info of non-existing user", async () => {
    // create a new use with a new refeerral code
    const createOrUpdateUserInput = {
      wallet: testAccount.address,
      referralCode: referralCode2,
    };
    const validUserSignatureInput = await getSignature(testAccount);
    await testServer.executeOperation({
      query: CREATE_OR_UPDATE_USER,
      variables: {
        createOrUpdateUserInput: createOrUpdateUserInput,
        userSignatureInput: validUserSignatureInput,
      },
    });

    // check referralCode status
    const res: any = await testServer.executeOperation({
      query: IS_TAKEN_REFERRAL_CODE,
      variables: {
        referralCode: referralCode2,
      },
    });

    expect(res.data.isTakenReferalCode.status).toEqual(true);
  });
});
