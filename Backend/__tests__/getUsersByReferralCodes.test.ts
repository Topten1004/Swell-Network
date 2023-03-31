import { ethers } from "ethers";

import { server } from "../app";
import { GET_USERS_BY_REFERRAL_CODES } from "../shared/graphql";
import { createUser, deleteAll } from "./utils/index";

jest.setTimeout(70000);

const testServer = server;
const testAccount1 = ethers.Wallet.createRandom();
const testAccount2 = ethers.Wallet.createRandom();
const referralCode1 = "referral_code_1";
const referralCode2 = "referral_code_2";
const referralCode3 = "referral_code_3";

beforeAll(async () => {
  await deleteAll();
  await createUser(testAccount1, referralCode1);
  await createUser(testAccount2, referralCode2);
});

describe("getUsersByReferralCodes query API test", () => {
  test("(1) should be success to fetch the info with an referralCode array of single item", async () => {
    // call
    const res: any = await testServer.executeOperation({
      query: GET_USERS_BY_REFERRAL_CODES,
      variables: {
        referralCodes: [referralCode1],
      },
    });

    expect(res.data.getUsersByReferralCodes[0].wallet).toEqual(
      testAccount1.address
    );
    expect(res.data.getUsersByReferralCodes[0].referralCode).toEqual(
      referralCode1
    );
  });

  test("(2) should be success to fetch the info with an referralCode array of multiple items", async () => {
    // call
    const res: any = await testServer.executeOperation({
      query: GET_USERS_BY_REFERRAL_CODES,
      variables: {
        referralCodes: [referralCode1, referralCode2],
      },
    });

    expect(res.data.getUsersByReferralCodes[0].wallet).toEqual(
      testAccount1.address
    );
    expect(res.data.getUsersByReferralCodes[0].referralCode).toEqual(
      referralCode1
    );
    expect(res.data.getUsersByReferralCodes[1].wallet).toEqual(
      testAccount2.address
    );
    expect(res.data.getUsersByReferralCodes[1].referralCode).toEqual(
      referralCode2
    );
  });

  test("(3) should be success with null resonse from non-existing referral code", async () => {
    // call
    const res: any = await testServer.executeOperation({
      query: GET_USERS_BY_REFERRAL_CODES,
      variables: {
        referralCodes: [referralCode3],
      },
    });
    expect(res.data.getUsersByReferralCodes[0]).toEqual(undefined);
  });
});
