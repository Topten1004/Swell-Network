import * as yup from 'yup';

// eslint-disable-next-line import/prefer-default-export
export const ReferralCodeSchema = yup.object().shape({
  referralCode: yup
    .string()
    .required()
    .label('Referral Code')
    .min(4, 'Referral code length should be between 4 and 16')
    .max(16, 'Referral code length should be between 4 and 16'),
});
