import { FC, useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Box, BoxProps, Button, Card, styled, useTheme } from '@mui/material';
import { BigNumber, ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { SWNFT_ADDRESS } from '../../../constants/addresses';
import { SWETH } from '../../../constants/tokens';
import { useSWETHContract } from '../../../hooks/useContract';
import { useV3PositionsFromTokenIds } from '../../../hooks/useV3Positions';
import { useTokenBalance } from '../../../lib/hooks/useCurrencyBalance';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setIsWalletModalOpen } from '../../../state/modal/modalSlice';
import { setIsBatchApprovalInProgress } from '../../../state/transactionProgress/transactionProgressSlice';
import { ListColumn, SwellIcon } from '../../../theme/uiComponents';
import { displayErrorMessage } from '../../../utils/errors';
import PriceInput from '../../common/PriceInput';
import Web3Status from '../../common/Web3Status';

const Row = styled(ListColumn)({
  fontSize: 13,
  fontWeight: '500',
  span: {
    fontWeight: '300',
  },
  padding: '5px 0',
});

export enum LiquidityTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

interface LiquidityTransactionProps extends BoxProps {
  type: LiquidityTransactionType;
}

const LiquidityTransactionModal: FC<LiquidityTransactionProps> = ({ type, sx, ...props }) => {
  const {
    watch,
    setValue,
    formState: { isSubmitting },
  } = useFormContext();
  const theme = useTheme();
  const { account, chainId } = useWeb3React();
  const dispatch = useAppDispatch();
  const { isBatchApprovalInProgress, isBatchWithdrawalInProgress, isBatchDepositInProgress } = useAppSelector(
    (state) => state.transactionProgress
  );

  const { enqueueSnackbar } = useSnackbar();
  const swETHContract = useSWETHContract();
  const swETHBalance = useTokenBalance(account ?? undefined, chainId ? SWETH[chainId] : undefined);

  const [isApproved, setApproved] = useState<boolean>(type !== LiquidityTransactionType.DEPOSIT);
  const [isApprovalInProgress, setApprovalInProgress] = useState<boolean>(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [isBalanceInsufficient, setBalanceInsufficient] = useState(false);

  const watchPositions = watch('positions');
  const watchAmount = watch('amount');
  const [displayBalance, setDisplayBalance] = useState<string>('0');
  const [available, setAvailable] = useState<string>('0.00');

  // fetch data of all the selected positions
  const { loading, positions: selectedPositionsData } = useV3PositionsFromTokenIds(
    selectedPositions.map((selectedPosition) => BigNumber.from(selectedPosition))
  );

  // set selected positions on user update
  useEffect(() => {
    if (watchPositions) {
      setSelectedPositions(watchPositions);
    }
  }, [watchPositions]);

  // Display and set available balance for deposit
  useEffect(() => {
    if (type === LiquidityTransactionType.DEPOSIT && swETHBalance) {
      const availableBalance = ethers.utils.parseEther(swETHBalance?.toFixed(0).split('.')[0]);
      const formattedBalance = ethers.utils.formatEther(availableBalance);
      setDisplayBalance(formattedBalance.split('.')[0]);
      setAvailable(formattedBalance);
    }
  }, [swETHBalance, type]);

  // set available amount to field
  useEffect(() => {
    if (selectedPositions.length > 0) {
      if (Number(available) < 0 && Number(displayBalance) < 0 && type === LiquidityTransactionType.DEPOSIT) {
        enqueueSnackbar('Insufficient Balance', { variant: 'error' });
      } else if (Number(available) >= 0 && Number(displayBalance) >= 0 && type === LiquidityTransactionType.DEPOSIT) {
        setValue('amount', available);
      }
    }
  }, [available, displayBalance, enqueueSnackbar, selectedPositions, setValue, type]);

  // check if available to withdraw is zero and disable button
  useEffect(() => {
    if (type === LiquidityTransactionType.DEPOSIT) {
      if (Number(available) === 0) {
        setBalanceInsufficient(true);
      } else {
        setBalanceInsufficient(false);
      }
    }
  }, [available, type]);

  // calculate available value
  // CASE OF DEPOSIT
  useEffect(() => {
    if (
      type === LiquidityTransactionType.DEPOSIT &&
      swETHBalance &&
      selectedPositions &&
      selectedPositions.length > 0
    ) {
      const availableBalance = Number(swETHBalance?.toFixed(0).split('.')[0]);
      const availableBalancePerPosition = Math.floor(availableBalance / selectedPositions.length).toString();
      setAvailable(availableBalancePerPosition);
      setDisplayBalance(availableBalancePerPosition);
    }
  }, [selectedPositions, swETHBalance, type]);
  // CASE OF WITHDRAW
  useEffect(() => {
    if (
      !loading &&
      selectedPositionsData &&
      selectedPositionsData.length > 0 &&
      swETHBalance &&
      type === LiquidityTransactionType.WITHDRAW
    ) {
      const allPositionsBalances = selectedPositionsData.map((position) =>
        Number(ethers.utils.formatEther(position.baseTokenBalance))
      );
      const totalSum = (allPositionsBalances.length > 0 ? allPositionsBalances : [0]).reduce(
        (prevSum, currentValue) => prevSum + currentValue,
        0
      );
      setDisplayBalance(totalSum.toString());
    }
  }, [loading, selectedPositionsData, swETHBalance, type]);

  const fetchApprovalStatus = useCallback(async () => {
    if (
      account &&
      chainId &&
      watchAmount &&
      watchAmount !== '' &&
      selectedPositions &&
      selectedPositions.length > 0 &&
      swETHContract
    ) {
      try {
        const depositAmount = ethers.utils.parseEther(watchAmount.toString());
        const requiredAllowance = depositAmount.mul(selectedPositions.length);
        const allowance = await swETHContract.allowance(account, SWNFT_ADDRESS[chainId]);
        const approvalStatus = allowance.gte(requiredAllowance);
        setApproved(approvalStatus);
      } catch (e) {
        displayErrorMessage(enqueueSnackbar, e);
      }
    }
  }, [account, chainId, enqueueSnackbar, selectedPositions, swETHContract, watchAmount]);

  useEffect(() => {
    if (type === LiquidityTransactionType.DEPOSIT && chainId && watchAmount !== '') {
      fetchApprovalStatus();
    }
  }, [chainId, fetchApprovalStatus, type, watchAmount]);

  const approveHandler = async () => {
    dispatch(setIsBatchApprovalInProgress(true));
    setApprovalInProgress(true);
    try {
      if (
        swETHContract &&
        chainId &&
        watchAmount &&
        watchAmount !== '' &&
        selectedPositions &&
        selectedPositions.length > 0
      ) {
        const requiredAllowance = ethers.utils.parseEther(watchAmount.toString()).mul(selectedPositions.length);
        await swETHContract.estimateGas.approve(SWNFT_ADDRESS[chainId], requiredAllowance);
        const tx = await swETHContract.approve(SWNFT_ADDRESS[chainId], requiredAllowance);
        const receipt = await tx.wait();
        setApproved(!!receipt.status);
        if (receipt.status) {
          enqueueSnackbar('Approval successful', { variant: 'success' });
        } else {
          enqueueSnackbar('Approval unsuccessful', { variant: 'error' });
        }
      }
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    } finally {
      setApprovalInProgress(false);
      dispatch(setIsBatchApprovalInProgress(false));
    }
  };

  const hasPositions = selectedPositionsData && selectedPositionsData.length > 0;

  return (
    <Box {...props} sx={{ textAlign: 'center', ...sx }}>
      <Card
        sx={{
          padding: '22px',
          maxWidth: '400px',
          margin: '20px auto',
          width: '100%',
        }}
      >
        <Web3Status sx={{ marginBottom: '26px', marginInline: 'auto' }} variant="outlined" />
        <Row>
          Available to {type === LiquidityTransactionType.DEPOSIT ? 'add per position' : 'withdraw'}
          <span>
            <SwellIcon size="xs" />
            {displayBalance ?? '0.00'}
          </span>
        </Row>
        {type === LiquidityTransactionType.DEPOSIT && (
          <Row>
            Annual percentage rate
            <span>4%</span>
          </Row>
        )}
        {type === LiquidityTransactionType.DEPOSIT && (
          <PriceInput
            adornmentType="node"
            icon="swell"
            maxAmount={BigNumber.from(available.split('.')[0])}
            name="amount"
            required
            sx={{ marginTop: '24px' }}
            tooltip="Must be at least 1 swETH and must be an integer(whole number)"
          />
        )}
        {/* eslint-disable-next-line no-nested-ternary */}
        {account ? (
          isApproved ? (
            <LoadingButton
              disabled={
                true ||
                (type === LiquidityTransactionType.DEPOSIT ? isBatchDepositInProgress : isBatchWithdrawalInProgress) ||
                isSubmitting ||
                isBalanceInsufficient ||
                !hasPositions
              }
              fullWidth
              loading={
                (type === LiquidityTransactionType.DEPOSIT ? isBatchDepositInProgress : isBatchWithdrawalInProgress) ||
                isSubmitting
              }
              sx={{
                color: theme.palette.grey.A400,
                marginBottom: '10px',
                textTransform: 'none',
                marginTop: type === LiquidityTransactionType.DEPOSIT ? 0 : '8px',
              }}
              type="submit"
              variant="contained"
            >
              {type === LiquidityTransactionType.DEPOSIT ? 'Add Liquidity' : 'Remove Liquidity'}
            </LoadingButton>
          ) : (
            <LoadingButton
              disabled={
                true || isBatchApprovalInProgress || isApprovalInProgress || isBalanceInsufficient || !hasPositions
              }
              fullWidth
              loading={isBatchApprovalInProgress || isApprovalInProgress}
              onClick={approveHandler}
              size="large"
              sx={{ color: theme.palette.grey.A400, marginBottom: '10px', textTransform: 'none' }}
              variant="contained"
            >
              Approve
            </LoadingButton>
          )
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
      </Card>
    </Box>
  );
};

export default LiquidityTransactionModal;
