import { ethers } from "ethers";

import { server } from "../app";
import { GET_USER_BY_WALLET } from "../shared/graphql";
import { createNodeOperator, deleteAll } from "./utils/index";

jest.setTimeout(70000);

const testServer = server;
const testAccount = ethers.Wallet.createRandom();
const testAccount1 = ethers.Wallet.createRandom();

beforeAll(async () => {
  await deleteAll();

  await createNodeOperator(testAccount);
});

describe("getUserByWallet query API test", () => {
  test("(1) should be success to fetch the info of existing user", async () => {
    // call
    const res: any = await testServer.executeOperation({
      query: GET_USER_BY_WALLET,
      variables: {
        wallet: testAccount.address,
      },
    });

    expect(res.data.getUserByWallet.wallet).toEqual(testAccount.address);
  });

  test("(2) should be reverted to get the info of non-existing user", async () => {
    // call
    const res: any = await testServer.executeOperation({
      query: GET_USER_BY_WALLET,
      variables: {
        wallet: testAccount1.address,
      },
    });
    expect(res.data.getUserByWallet).toEqual(null);
  });
});
