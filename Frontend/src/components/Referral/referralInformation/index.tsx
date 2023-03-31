import { FC, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useLazyQuery, useMutation } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { BoxProps, Button, styled, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import WarningIcon from '../../../assets/images/icon-warning.svg';
import TwitterLogo from '../../../assets/images/twitter.svg';
import {
  CREATE_OR_UPDATE_USER,
  GET_NONCE_BY_USER,
  GET_USER_BY_WALLET,
  IS_TAKEN_REFERRAL_CODE,
} from '../../../shared/graphql';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setIsReferralCodeUpdateModalOpen, setIsWalletModalOpen } from '../../../state/modal/modalSlice';
import { IReferralCode } from '../../../state/stake/stakeSlice';
import { displayErrorMessage } from '../../../utils/errors';
import { getReferredAmount } from '../../../utils/getSwellStats';
import { ReferralCodeSchema } from '../../../validations/referralCodeSchema';
import InputController from '../../common/InputController';
import ReferralCodeUpdateConfirmModal from '../../modal/referralCodeUpdateConfirmModal';
import Copy from './Copy';

const GeneralInfo = styled('div')(() => ({
  marginBottom: '44px',
}));

const UpdateInfo = styled('div')(() => ({
  marginBottom: '44px',
}));

const AmountInfo = styled('div')(() => ({
  marginBottom: '28px',
}));

const WarningInfo = styled('div')(() => ({
  marginBottom: '64px',
}));

const ShareButtonContainer = styled('a')(() => ({
  marginTop: '14px',
  display: 'flex',
  justifyContent: 'center',
  textAlign: 'center',
  '&:hover': {
    textDecoration: 'none',
  },

  button: {
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: '15px',
    lineHeight: '150%',
    color: '#00B0F0',
  },
}));

const InfoText = styled('p')(() => ({
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: '16px',
  lineHeight: '150%',
  textAlign: 'center',
  color: '#5E6364',
  maxWidth: '390px',
  margin: 'auto',
}));

const WarningText = styled('p')(() => ({
  display: 'flex',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: '16px',
  lineHeight: '150%',
  textAlign: 'center',
  color: '#5E6364',
  maxWidth: '390px',
  margin: 'auto',
}));

const FormContainer = styled('form')(() => ({
  maxWidth: 440,
  width: '100%',
  margin: 'auto',
  marginTop: '44px',
}));

const InputWrapper = styled('div')(() => ({
  position: 'relative',
}));

const CopyWrapper = styled('div')(() => ({
  position: 'absolute',
  right: '10px',
  top: '32px',
}));

const TwitterIconWrapper = styled('div')({
  width: 34,
  height: 34,
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '11px',
});

const WarningIconWrapper = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '5px',
});

const ReferralInformationCard: FC<BoxProps> = () => {
  const { account, library } = useWeb3React();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const { isReferralCodeUpdateModalOpen } = useAppSelector((state) => state.modal);

  const [createOrUpdateUser] = useMutation(CREATE_OR_UPDATE_USER);
  const [getNonceByUser] = useMutation(GET_NONCE_BY_USER);
  const [fetchUserData, { loading, error: userDataFetchingError, data: fetchedUserData }] =
    useLazyQuery(GET_USER_BY_WALLET);
  const [
    isTakenReferalCode,
    { loading: isTakenReferalCodeLoading, error: isTakenReferalCodeFetchingError, data: isTakenReferalCodeData },
  ] = useLazyQuery(IS_TAKEN_REFERRAL_CODE);

  const method = useForm<IReferralCode>({
    mode: 'onSubmit',
    criteriaMode: 'all',
    shouldFocusError: true,
    resolver: yupResolver(ReferralCodeSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referredAmount, setReferredAmount] = useState('');
  const { handleSubmit, reset, setError, clearErrors, watch } = method;
  const newReferralCode = watch('referralCode');
  const currentReferralCode = fetchedUserData?.getUserByWallet?.referralCode;
  const canUpdate = !(
    isTakenReferalCodeData &&
    isTakenReferalCodeData.isTakenReferalCode.status &&
    newReferralCode !== currentReferralCode
  );
  const locationOrigin = window.location.origin;
  const tweetUrl = `${locationOrigin}/stake?referralCode=${currentReferralCode}`;

  const fetchReferralAmount = async () => {
    const amount = await getReferredAmount(currentReferralCode);
    setReferredAmount(amount);
  };

  // fetch user data
  useEffect(() => {
    if (account) {
      fetchUserData({
        variables: {
          wallet: account,
        },
      });
    }
  }, [account, fetchUserData]);

  // fetch user data
  useEffect(() => {
    if (currentReferralCode) {
      fetchReferralAmount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentReferralCode]);

  // fetch referralCode validation status
  useEffect(() => {
    clearErrors('referralCode');
    if (newReferralCode && newReferralCode.length >= 4 && newReferralCode.length <= 16) {
      isTakenReferalCode({
        variables: {
          referralCode: newReferralCode,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newReferralCode, isTakenReferalCode]);

  useEffect(() => {
    if (!loading && fetchedUserData) {
      reset({
        referralCode: fetchedUserData.getUserByWallet.referralCode,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, userDataFetchingError, fetchedUserData]);

  useEffect(() => {
    if (!isTakenReferalCodeLoading && isTakenReferalCodeData) {
      if (!canUpdate) {
        setError(
          'referralCode',
          { type: 'custom', message: 'Referral code already in use, please choose another' },
          { shouldFocus: true }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isTakenReferalCodeFetchingError, isTakenReferalCodeData]);

  const onSubmit = (data: IReferralCode) => {
    try {
      if (account && !isSubmitting) {
        setIsSubmitting(true);
        getNonceByUser({
          variables: {
            userUniqueInput: {
              wallet: account,
            },
          },
          async onCompleted({ nonceByUser }) {
            try {
              const { nonce, timestamp } = nonceByUser;
              const signer = library.getSigner();
              const signature = await signer.signMessage(`I am signing my one-time nonce: ${nonce}`);
              createOrUpdateUser({
                variables: {
                  createOrUpdateUserInput: {
                    referralCode: data.referralCode,
                    wallet: account,
                  },
                  userSignatureInput: {
                    wallet: account,
                    signature,
                    timestamp,
                  },
                },
                onCompleted(res) {
                  setIsSubmitting(false);
                  if (res.createOrUpdateUser) {
                    enqueueSnackbar(!currentReferralCode ? 'Referral code created' : 'Referral code updated', {
                      variant: 'success',
                    });
                    reset({
                      referralCode: res.createOrUpdateUser.referralCode,
                    });
                  }
                },
                onError(error) {
                  setIsSubmitting(false);
                  enqueueSnackbar(error.message, { variant: 'error' });
                  reset({
                    referralCode: '',
                  });
                },
              });
            } catch (error) {
              setIsSubmitting(false);
              displayErrorMessage(enqueueSnackbar, error);
            }
          },
          onError(error) {
            setIsSubmitting(false);
            enqueueSnackbar(error.message, { variant: 'error' });
          },
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      displayErrorMessage(enqueueSnackbar, error);
    }
  };

  return (
    <>
      {isReferralCodeUpdateModalOpen && <ReferralCodeUpdateConfirmModal referralCode={newReferralCode} />}
      <FormProvider {...method}>
        <GeneralInfo>
          <InfoText>
            Create and use your unique referral link below to share with your network and earn rewards.
          </InfoText>
        </GeneralInfo>
        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          {account ? (
            <>
              <AmountInfo>
                <InfoText>
                  <span>{`Total amount referred: `}</span>
                  <span>
                    <b>{`${Number(referredAmount).toFixed(2)} ETH`}</b>
                  </span>
                </InfoText>
              </AmountInfo>
              {currentReferralCode && (
                <UpdateInfo>
                  <InfoText>Updating your referral code will mean all previous referrals will be lost.</InfoText>
                </UpdateInfo>
              )}
              <InputWrapper>
                <InputController
                  disabled={loading}
                  id="referralCode"
                  label="Referral Code"
                  name="referralCode"
                  placeholder="Minimum 4 characters"
                  required
                />
                {account && currentReferralCode && (
                  <CopyWrapper>
                    <Copy toCopy={`${locationOrigin}/stake?referralCode=${newReferralCode}`}>COPY LINK</Copy>
                  </CopyWrapper>
                )}
              </InputWrapper>

              {!currentReferralCode ? (
                <LoadingButton
                  disabled={loading || isTakenReferalCodeLoading || !canUpdate}
                  fullWidth
                  loading={isSubmitting}
                  onClick={() => {}}
                  size="large"
                  sx={{ color: theme.palette.grey.A400 }}
                  type="submit"
                  variant="contained"
                >
                  Create Referral Code
                </LoadingButton>
              ) : (
                <Button
                  disabled={
                    loading || isTakenReferalCodeLoading || !canUpdate || newReferralCode === currentReferralCode
                  }
                  fullWidth
                  onClick={() => dispatch(setIsReferralCodeUpdateModalOpen(true))}
                  size="large"
                  sx={{
                    color: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light,
                    border: `2px solid #fff`,
                  }}
                  type="button"
                  variant="contained"
                >
                  Update Referal Code
                </Button>
              )}
              {currentReferralCode && (
                <ShareButtonContainer href={`https://twitter.com/intent/tweet?text=${tweetUrl}`} target="_blank">
                  <Button
                    onClick={() => {}}
                    size="small"
                    sx={{ fontWeight: 500, marginTop: '20px', padding: 0 }}
                    variant="text"
                  >
                    <TwitterIconWrapper>
                      <img alt="Twiiter logo" src={TwitterLogo} />
                    </TwitterIconWrapper>
                    Share via Twitter
                  </Button>
                </ShareButtonContainer>
              )}
            </>
          ) : (
            <>
              <WarningInfo>
                <WarningText>
                  <WarningIconWrapper>
                    <img alt="warning icon" src={WarningIcon} />
                  </WarningIconWrapper>
                  Connect your wallet to access your referral ID
                </WarningText>
              </WarningInfo>
              <Button
                fullWidth
                onClick={() => dispatch(setIsWalletModalOpen(true))}
                size="large"
                sx={{ color: theme.palette.grey.A400 }}
              >
                Connect wallet
              </Button>
            </>
          )}
        </FormContainer>
      </FormProvider>
    </>
  );
};

export default ReferralInformationCard;
