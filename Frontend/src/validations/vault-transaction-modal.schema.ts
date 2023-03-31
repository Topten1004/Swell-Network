import * as yup from 'yup';

// eslint-disable-next-line import/prefer-default-export
export const vaultTransactionModalSchema = yup.object().shape({
  amount: yup
    .number()
    .required()
    .transform((value) => (Number.isNaN(value) ? 0 : value))
    .min(1, 'Amount must be at least 1 ETH')
    .integer('Amount must be an integer(whole number)')
    .label('Amount'),
  strategy: yup.number().required().label('Vault'),
  positions: yup.array().of(yup.number()).required().min(1).label('Positions'),
});
