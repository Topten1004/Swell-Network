import { ethers } from "ethers";

import { server } from "../app";
import { GET_STAKE_AMOUNT_BY_NODE_OPERATOR } from "../shared/graphql";
import {
  activateValidator,
  createDepositData,
  createNodeOperator,
  deleteAll,
  getNodeOperatorByUserId,
  getValidatorByNodeOperator,
} from "./utils/index";

jest.setTimeout(70000);

const testServer = server;
const testAccount = ethers.Wallet.createRandom();

let validNodeOperator: any;

beforeAll(async () => {
  await deleteAll();

  const userData = await createNodeOperator(testAccount);
  validNodeOperator = await getNodeOperatorByUserId(userData.id);
  await createDepositData(testAccount, validNodeOperator.id);
});

describe("stakeAmountByNodeOperator Mutation API test", () => {
  test("(1) should be succeeded with valid nodeOperatorUniqueInput when the validator is activated", async () => {
    const validator = await getValidatorByNodeOperator(validNodeOperator.id);

    await activateValidator(validator.id);

    // call
    const res: any = await testServer.executeOperation({
      query: GET_STAKE_AMOUNT_BY_NODE_OPERATOR,
      variables: {
        id: validNodeOperator.id,
      },
    });

    expect(Number(res.data.stakeAmountByNodeOperator.amount)).toBeGreaterThan(
      0
    );
  });
});
