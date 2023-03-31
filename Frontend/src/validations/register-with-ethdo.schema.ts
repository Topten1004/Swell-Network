import * as yup from 'yup';

// eslint-disable-next-line import/prefer-default-export
export const RegisterWithEthdoSchema = yup.object().shape({
  publicKey: yup.string().nullable(true).required().label('Public key'),
  totalEth: yup.string().required().label('Total ETH'),
  depositData: yup.string().required().label('Deposit data (JSON)'),
});
