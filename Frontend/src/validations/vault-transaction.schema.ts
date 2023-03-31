import * as yup from 'yup';

// eslint-disable-next-line import/prefer-default-export
export const vaultTransactionSchema = yup.object().shape({
  amount: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? 0 : value))
    .required()
    .min(1, 'Amount must be at least 1 ETH')
    .integer('Amount must be an integer(whole number)')
    .label('Amount'),
  position: yup
    .object()
    .nullable(true)
    .shape({ name: yup.number(), swEthBalance: yup.number() })
    .required()
    .label('Position'),
});
