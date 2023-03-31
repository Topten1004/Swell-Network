import { FC, memo, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useLazyQuery } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Card, CircularProgress, styled, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import PriceInput from '../components/common/PriceInput';
import Web3Status from '../components/common/Web3Status';
import { StakeButtons } from '../components/stake/StakeButtons';
import TransactionDetails from '../components/stake/TransactionDetails';
import { GET_STAKE_AMOUNT_BY_NODE_OPERATOR } from '../shared/graphql';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { setIsConfirmStakeModalOpen, setIsNodeOperatorModalOpen } from '../state/modal/modalSlice';
import { setStakeAmount, StakingPage } from '../state/stake/stakeSlice';
import { useNativeCurrencyBalances } from '../state/wallet/hooks';
import { EthereumIcon, ListColumn } from '../theme/uiComponents';
import { displayErrorMessage } from '../utils/errors';
import getAPR from '../utils/getAPR';
import { stakeFormSchema as schema } from '../validations/stakeFormSchema';

const Row = styled(ListColumn)({
  paddingInline: '11px',
});

interface IStakeForm {
  amount: number;
}

const Stake: FC = () => {
  const { account } = useWeb3React();
  const method = useForm<IStakeForm>({
    mode: 'onSubmit',
    criteriaMode: 'all',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      amount: undefined,
    },
  });
  const dispatch = useAppDispatch();
  const { selectedNodeOperator } = useAppSelector((state) => state.nodeOperator);
  const { APR, GetAPRError, loadingAPR } = useAppSelector((state) => state.stats);
  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[account ?? ''];
  const { handleSubmit, setError, setValue } = method;
  const [fetchStakeAmountByNodeOperator] = useLazyQuery(GET_STAKE_AMOUNT_BY_NODE_OPERATOR);
  const { enqueueSnackbar } = useSnackbar();
  const [currentNodeMaxStakingAvailalbeAmount, setCurrentNodeMaxStakingAvailalbeAmount] = useState(0);
  const [isFetchingStakeAmountByNodeOperator, SetIsFetchingStakeAmountByNodeOperator] = useState(false);

  let currentNodeOperatorId = 0;
  if (selectedNodeOperator && typeof selectedNodeOperator.id === 'number') {
    currentNodeOperatorId = selectedNodeOperator.id;
  }

  // get and set availalbe max staking amount of current node operator
  useEffect(() => {
    if (currentNodeOperatorId) {
      SetIsFetchingStakeAmountByNodeOperator(true);
      fetchStakeAmountByNodeOperator({
        variables: {
          id: currentNodeOperatorId,
        },
        onCompleted({ stakeAmountByNodeOperator: stakeAmount }) {
          setCurrentNodeMaxStakingAvailalbeAmount(Number(stakeAmount.amount));
          SetIsFetchingStakeAmountByNodeOperator(false);
        },
        onError(error) {
          enqueueSnackbar(error.message, { variant: 'error' });
        },
      });
    }
  }, [currentNodeOperatorId, enqueueSnackbar, fetchStakeAmountByNodeOperator]);

  useEffect(() => {
    if (!account) {
      setValue('amount', 0);
    }
  }, [setValue, account]);

  const onSubmit = (data: IStakeForm) => {
    try {
      if (data.amount) {
        if (data.amount > currentNodeMaxStakingAvailalbeAmount) {
          setError('amount', {
            message: `${currentNodeMaxStakingAvailalbeAmount} ETH is the maximum staking amount, please reduce amount or choose another node operator`,
            type: 'manual',
          });
          return;
        }
        dispatch(setStakeAmount({ amount: data.amount, page: StakingPage.STAKE }));
        dispatch(setIsConfirmStakeModalOpen(true));
      } else {
        setError('amount', { message: 'Amount must be at least 1 ETH', type: 'manual' });
      }
      // eslint-disable-next-line no-empty
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    }
  };

  return (
    <>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h2">Stake ETH</Typography>
        <Card sx={{ padding: ['20px 10px', '22px'], maxWidth: '400px', margin: '20px auto', width: '100%' }}>
          <Web3Status isPointer={false} sx={{ marginBottom: '26px', marginInline: 'auto' }} />
          <Row>
            Available to stake
            <span>
              <EthereumIcon sx={{ height: 12, width: 12, marginRight: '5px' }} />
              <span>{userEthBalance?.toFixed(3) ?? '0.000'}</span>
            </span>
          </Row>
          <Row sx={{ marginBottom: '24px' }}>
            Annual percentage rate
            {GetAPRError ? (
              <Button
                onClick={getAPR}
                size="small"
                sx={{
                  fontSize: 10,
                  fontStyle: 'italic',
                  display: 'block',
                  textDecoration: 'underline',
                  padding: 0,
                  minWidth: 0,
                }}
                variant="text"
              >
                reload
              </Button>
            ) : (
              <span>{loadingAPR ? <CircularProgress size={15} /> : `${APR}%`}</span>
            )}
          </Row>
          {!isFetchingStakeAmountByNodeOperator ? (
            <FormProvider {...method}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <PriceInput
                  adornmentType="node"
                  disabled={!currentNodeOperatorId}
                  maxAmount={
                    userEthBalance && currentNodeMaxStakingAvailalbeAmount
                      ? BigNumber.from(
                          Number(userEthBalance?.toFixed(0)) > currentNodeMaxStakingAvailalbeAmount
                            ? currentNodeMaxStakingAvailalbeAmount
                            : Number(userEthBalance?.toFixed(0))
                        )
                      : BigNumber.from(0)
                  }
                  name="amount"
                  tooltip="Must be at least 1 ETH and must be an integer(whole number)"
                />
                <StakeButtons ethBalance={userEthBalance} watchField="amount" />
              </form>
              <TransactionDetails watchField="amount" />
            </FormProvider>
          ) : (
            <CircularProgress />
          )}

          <Row sx={{ alignItems: 'flex-start' }}>
            Node Operator
            <Box
              component="span"
              sx={{
                flexFlow: 'column !important',
                alignItems: 'flex-end !important',
                gap: '0 !important',
              }}
            >
              {selectedNodeOperator?.name}
              <Button
                onClick={() => dispatch(setIsNodeOperatorModalOpen(true))}
                size="small"
                sx={{
                  fontSize: 10,
                  fontStyle: 'italic',
                  display: 'block',
                  textDecoration: 'underline',
                  padding: 0,
                  minWidth: 0,
                }}
                variant="text"
              >
                Change
              </Button>
            </Box>
          </Row>
          {currentNodeOperatorId > 0 && (
            <Row sx={{ alignItems: 'flex-start' }}>
              Maximum staking amount
              {!isFetchingStakeAmountByNodeOperator ? (
                <span>{currentNodeMaxStakingAvailalbeAmount ?? 0} ETH</span>
              ) : (
                <CircularProgress size={20} />
              )}
            </Row>
          )}
        </Card>
      </Box>
    </>
  );
};

export default memo(Stake);
