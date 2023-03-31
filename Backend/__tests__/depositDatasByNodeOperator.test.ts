import { ethers } from "ethers";

import { server } from "../app";
import { GET_DEPOSIT_DATAS_BY_NODE_OPERATOR } from "../shared/graphql";
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

describe("depositDatasByNodeOperator Mutation API test", () => {
  test("(1) should be reverted when amount is invalid", async () => {
    // prepare mutation variables
    const invalidAmount = "1.5";

    const validNodeOperatorUniqueInput = 2;

    // call
    const res: any = await testServer.executeOperation({
      query: GET_DEPOSIT_DATAS_BY_NODE_OPERATOR,
      variables: {
        amount: invalidAmount,
        id: validNodeOperatorUniqueInput,
      },
    });

    expect(res.errors[0].message).toEqual("Stake value not multiple of Ether");
  });

  test("(2) should be reverted with Not enough available validators when node operator does not have enough available validators", async () => {
    // prepare mutation variables
    const validAmount = "1";

    const invalidNodeOperatorUniqueInput = 3;

    // call
    const res: any = await testServer.executeOperation({
      query: GET_DEPOSIT_DATAS_BY_NODE_OPERATOR,
      variables: {
        amount: validAmount,
        id: invalidNodeOperatorUniqueInput,
      },
    });

    expect(res.errors[0].message).toEqual("Not enough available validators");
  });

  test("(3) should be reverted with valid amount and nodeOperatorUniqueInput when the validator is not activated", async () => {
    // prepare mutation variables
    const validAmount = "1";

    // call
    const res: any = await testServer.executeOperation({
      query: GET_DEPOSIT_DATAS_BY_NODE_OPERATOR,
      variables: {
        amount: validAmount,
        id: validNodeOperator.id,
      },
    });

    expect(res.errors[0].message).toEqual("Not enough available validators");
  });

  test("(4) should be succeeded with valid amount and nodeOperatorUniqueInput when the validator is activated", async () => {
    const validator = await getValidatorByNodeOperator(validNodeOperator.id);
    await activateValidator(validator.id);

    // prepare mutation variables
    const validAmount = "1";

    // call
    const res: any = await testServer.executeOperation({
      query: GET_DEPOSIT_DATAS_BY_NODE_OPERATOR,
      variables: {
        amount: validAmount,
        id: validNodeOperator.id,
      },
    });

    expect(res.data.depositDatasByNodeOperator.length).toBeGreaterThan(0);
  });
});
