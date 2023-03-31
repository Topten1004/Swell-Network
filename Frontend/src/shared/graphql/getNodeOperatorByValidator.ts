import { gql } from "@apollo/client/core";

const GET_NODE_OPERATOR_BY_VALIDATOR = gql(`
  query NodeOperatorByValidator($pubKey: String!) {
    nodeOperatorByValidator(validatorUniqueInput: { pubKey: $pubKey }) {
      id
      name
      logo
    }
  }
`);

export { GET_NODE_OPERATOR_BY_VALIDATOR };
