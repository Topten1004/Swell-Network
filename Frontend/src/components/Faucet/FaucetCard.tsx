import { FC, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useMutation } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { BoxProps, Button, styled, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { SupportedChainId } from '../../constants/chains';
import useActiveWeb3React from '../../hooks/useActiveWeb3React';
import { GET_NONCE_BY_USER, REFERRAL_BY_USER } from '../../shared/graphql';
import { useAppDispatch } from '../../state/hooks';
import { setIsWalletModalOpen } from '../../state/modal/modalSlice';
import { IReferral } from '../../state/referral/Referral.interface';
import { displayErrorMessage } from '../../utils/errors';
import { ReferralByUserSchema } from '../../validations/referralByUserSchema';
import InputController from '../common/InputController';

const DEFAULT_SWELL_NETWORK_NODE_OPERATOR_ID = process.env.REACT_APP_DEFAULT_SWELL_NETWORK_NODE_OPERATOR_ID;
if (typeof DEFAULT_SWELL_NETWORK_NODE_OPERATOR_ID === 'undefined') {
  throw new Error(`REACT_APP_DEFAULT_SWELL_NETWORK_NODE_OPERATOR_ID must be a defined environment variable`);
}

if (!process.env.REACT_APP_DISCORD_CLIENT_ID) {
  throw new Error(`REACT_APP_DISCORD_CLIENT_ID must be a defined environment variable`);
}

const FormContainer = styled('form')(() => ({
  maxWidth: 440,
  width: '100%',
  margin: 'auto',
}));

const FaucetCard: FC<BoxProps> = () => {
  const { account, library } = useWeb3React();
  const { chainId } = useActiveWeb3React();

  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [createReferral] = useMutation(REFERRAL_BY_USER);
  const [getNonceByUser] = useMutation(GET_NONCE_BY_USER);

  const method = useForm<IReferral>({
    mode: 'onSubmit',
    criteriaMode: 'all',
    shouldFocusError: true,
    resolver: yupResolver(ReferralByUserSchema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleSubmit } = method;

  const [code, setCode] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const verifyCode = queryParams.get('code');
    setCode(verifyCode === null ? '' : verifyCode);
  }, []);

  const getDiscordVerifyCode = () => {
    const hostname = window.location.origin;
    const hosturl = hostname.replaceAll(':', '%3A').replaceAll('/', '%2F');
    let redirectUrl;
    if (chainId === SupportedChainId.GOERLI) {
      redirectUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.REACT_APP_DISCORD_CLIENT_ID}&redirect_uri=${hosturl}%2Fgoerli-faucet&response_type=code&scope=guilds%20guilds.members.read`;
    }
    if (chainId === SupportedChainId.KALEIDO) {
      redirectUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.REACT_APP_DISCORD_CLIENT_ID}&redirect_uri=${hosturl}%2Fkaleido-faucet&response_type=code&scope=guilds%20guilds.members.read`;
    }
    if (redirectUrl) window.location.href = redirectUrl;
  };

  const onSubmit = (data: IReferral) => {
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
              createReferral({
                variables: {
                  referralCreateInput: {
                    code: code === '' ? '' : code,
                    wallet: data.walletAddress,
                  },
                  userSignatureInput: {
                    wallet: account,
                    signature,
                    timestamp,
                  },
                },
                onCompleted({ referralByUser }) {
                  setIsSubmitting(false);
                  if (referralByUser) {
                    enqueueSnackbar('Referral successful', { variant: 'success' });
                    setCode('');
                  }
                },
                onError(error) {
                  setIsSubmitting(false);
                  enqueueSnackbar(error.message, { variant: 'error' });
                  setCode('');
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
    <FormProvider {...method}>
      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <InputController
          disabled={code === ''}
          id="walletAddress"
          label="Wallet Address"
          name="walletAddress"
          placeholder="0x142BD81e91654f655EcB0E01013b68a77aa63620"
          required
        />
        {account ? (
          <LoadingButton
            fullWidth
            loading={isSubmitting}
            onClick={code === '' ? () => getDiscordVerifyCode() : () => {}}
            sx={{ color: theme.palette.grey.A400 }}
            type={code === '' ? 'button' : 'submit'}
            variant="contained"
          >
            {code === '' ? 'Verify' : 'Submit'}
          </LoadingButton>
        ) : (
          <Button
            fullWidth
            onClick={() => dispatch(setIsWalletModalOpen(true))}
            size="large"
            sx={{ color: theme.palette.grey.A400 }}
          >
            Connect wallet
          </Button>
        )}
      </FormContainer>
    </FormProvider>
  );
};

export default FaucetCard;
