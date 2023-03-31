import * as yup from 'yup';

// eslint-disable-next-line import/prefer-default-export
export const ReferralByUserSchema = yup.object().shape({
  walletAddress: yup.string().required().label('Wallet Address'),
});
