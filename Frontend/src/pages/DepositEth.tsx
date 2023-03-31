/* eslint-disable no-empty */
/* eslint-disable react/jsx-no-duplicate-props */
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowBack } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import SuccessImage from '../assets/images/Success.png';
import PriceInput from '../components/common/PriceInput';
import { useSwNftContract } from '../hooks/useContract';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { setIsConfirmStakeModalOpen, setIsDesktopOnlyModalOpen, setIsWalletModalOpen } from '../state/modal/modalSlice';
import { setStakeAmount, StakingPage } from '../state/stake/stakeSlice';
import { displayErrorMessage } from '../utils/errors';
import { isMobile } from '../utils/userAgent';
import { depositStakeFormSchema as schema } from '../validations/depositStakeFormSchema';

const Layout = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
}));

interface IDepositStakeForm {
  amount: number;
  publicKey: string | null;
}

const DepositEth: React.FC = () => {
  const { account } = useWeb3React();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const matches = useMediaQuery(`@media only screen and (max-width:${theme.breakpoints.values.sm}px)`);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { nodeOperatorId } = useParams();
  const swNFTContract = useSwNftContract();

  const [minValue, setMinValue] = useState(16);

  if (!nodeOperatorId) {
    navigate('/become-a-node-operator');
  }
  const { selectedPublicKey, isSubmissionComplete } = useAppSelector((state) => state.registerEthDo);
  const method = useForm<IDepositStakeForm>({
    mode: 'onSubmit',
    criteriaMode: 'all',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: { amount: minValue },
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
    setError,
    setValue,
  } = method;
  const onSubmit = (data: IDepositStakeForm) => {
    try {
      if (data.amount) {
        dispatch(setStakeAmount({ amount: data.amount, page: StakingPage.DEPOSIT_ETHEREUM }));
        dispatch(setIsConfirmStakeModalOpen(true));
      } else {
        setError('amount', { message: `Amount must be at least ${minValue} ETH`, type: 'manual' });
      }
      // eslint-disable-next-line no-empty
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    }
  };

  useEffect(() => {
    if (nodeOperatorId) {
      if (!isSubmissionComplete) {
        navigate(`/register-with-ethdo/${nodeOperatorId}`);
        enqueueSnackbar('Please submit deposit data first', { variant: 'error' });
      } else if (!selectedPublicKey) {
        navigate(`/register-with-ethdo/${nodeOperatorId}`);
        enqueueSnackbar('Please select public key first', { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, isSubmissionComplete, navigate, nodeOperatorId, selectedPublicKey]);

  useEffect(() => {
    if (isMobile) {
      dispatch(setIsDesktopOnlyModalOpen(true));
    }
  }, [dispatch]);

  useEffect(() => {
    const updateWhitelistStatus = async () => {
      let value = 16;
      if (selectedPublicKey && swNFTContract) {
        try {
          const res = await swNFTContract.whiteList(selectedPublicKey);
          const res1 = await swNFTContract.superWhiteList(selectedPublicKey);
          if (res1) {
            value = 0;
          } else if (res) {
            value = 1;
          }
        } catch (e) {
          displayErrorMessage(enqueueSnackbar, e);
        }
      }

      setMinValue(value);
      setValue('amount', value);
    };

    updateWhitelistStatus();
  }, [selectedPublicKey, setValue, swNFTContract, enqueueSnackbar]);

  return (
    <>
      {matches && (
        <Layout>
          <Typography component="span" onClick={() => navigate(`/register-with-ethdo/${nodeOperatorId}`)} role="button">
            <ArrowBack />
            Back to register with ethdo
          </Typography>
          <Typography component="h2" sx={{ marginBottom: '27px' }} variant="h2">
            {minValue ? 'Deposit Ethereum' : ''}
          </Typography>
        </Layout>
      )}
      <Card
        sx={{
          maxWidth: '600px',
          margin: 'auto',
          padding: '20px',
          backgroundColor: theme.palette.common.white,
        }}
      >
        <Box sx={{ maxWidth: '440px', margin: 'auto', textAlign: 'center' }}>
          {!matches && (
            <Typography
              component="span"
              onClick={() => navigate(`/register-with-ethdo/${nodeOperatorId}`)}
              role="button"
            >
              <ArrowBack />
              Back to register with ethdo
            </Typography>
          )}
          {minValue ? (
            <>
              <FormProvider {...method}>
                {!matches && (
                  <Typography component="h2" sx={{ marginBottom: '27px' }} variant="h2">
                    Deposit Ethereum
                  </Typography>
                )}
                <form onSubmit={handleSubmit(onSubmit)}>
                  <PriceInput
                    adornmentType="text"
                    disabled
                    inputProps={{ min: minValue }}
                    name="amount"
                    required
                    text={`*Minimum ${minValue} ETH Requirement`}
                    // value={minValue}
                  />
                  <Typography display="block" gutterBottom variant="body1">
                    It takes at least 12 hours for validator to be active after first deposit on Mainnet
                  </Typography>
                  {account ? (
                    // eslint-disable-next-line react/jsx-max-props-per-line
                    <LoadingButton
                      disabled={isSubmitting}
                      fullWidth
                      loading={isSubmitting}
                      type="submit"
                      variant="contained"
                    >
                      Stake
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
                </form>
              </FormProvider>
            </>
          ) : (
            <>
              <Box sx={{ mt: 6, mb: 4 }}>
                <img alt="" src={SuccessImage} />
              </Box>
              <Typography display="block" gutterBottom variant="body1">
                Your deposit data has been sucessfully submitted
              </Typography>
            </>
          )}
        </Box>
      </Card>
    </>
  );
};
export default DepositEth;
