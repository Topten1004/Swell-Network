import * as yup from 'yup';

// eslint-disable-next-line import/prefer-default-export
export const liquidityTransactionModalFormSchema = yup.object().shape({
  positions: yup
    .array()
    .of(yup.string())
    .min(1, 'Please choose positions to enter')
    .required('Please choose positions to enter')
    .label('Choose positions to enter'),
  amount: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? 0 : value))
    .min(1, 'Amount must be at least 1 swETH')
    .integer('Amount must be an integer(whole number)')
    .required('Amount must be at least 1 swETH')
    .label('Amount'),
});

export const liquidityTransactionModalFormWithdrawSchema = yup.object().shape({
  positions: yup
    .array()
    .of(yup.string())
    .min(1, 'Please choose positions to enter')
    .required('Please choose positions to enter')
    .label('Choose positions to enter'),
});
