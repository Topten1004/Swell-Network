import { FC, useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { LoadingButton } from '@mui/lab';
import { Box, BoxProps, Button, Card, styled, useTheme } from '@mui/material';
import { BigNumber, ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { SWNFT_ADDRESS } from '../../constants/addresses';
import { SWETH } from '../../constants/tokens';
import { useSWETHContract } from '../../hooks/useContract';
import { useV3PositionsFromTokenIds } from '../../hooks/useV3Positions';
import { useTokenBalance } from '../../lib/hooks/useCurrencyBalance';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { setIsWalletModalOpen } from '../../state/modal/modalSlice';
import { setIsSwETHApprovalInProgress } from '../../state/transactionProgress/transactionProgressSlice';
import { ListColumn, SwellIcon } from '../../theme/uiComponents';
import { displayErrorMessage } from '../../utils/errors';
import PriceInput from '../common/PriceInput';
import Web3Status from '../common/Web3Status';

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

const LiquidityTransaction: FC<LiquidityTransactionProps> = ({ type, sx, ...props }) => {
  const {
    watch,
    setValue,
    formState: { isSubmitting },
  } = useFormContext();
  const theme = useTheme();
  const { id: selectedPositionId } = useParams();
  const { account, chainId, library } = useWeb3React();
  const dispatch = useAppDispatch();
  const { isSwETHApprovalInProgress, isDepositInProgress, isWithdrawalInProgress } = useAppSelector(
    (state) => state.transactionProgress
  );
  const { enqueueSnackbar } = useSnackbar();
  const swETHContract = useSWETHContract();
  const swETHBalance = useTokenBalance(account ?? undefined, chainId ? SWETH[chainId] : undefined);

  const [isApproved, setApproved] = useState<boolean>(type !== LiquidityTransactionType.DEPOSIT);
  const [isApprovalInProgress, setApprovalInProgress] = useState<boolean>(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [isBalanceInsufficient, setBalanceInsufficient] = useState(false);

  const watchAmount = watch('amount');
  const [displayBalance, setDisplayBalance] = useState<string>('0.00');
  const [available, setAvailable] = useState<string>('0.00');

  // fetch data of all the selected positions
  const { loading, positions: selectedPositionsData } = useV3PositionsFromTokenIds(
    selectedPositions.map((selectedPosition) => BigNumber.from(selectedPosition))
  );

  useEffect(() => {
    if (selectedPositionId) setSelectedPositions([selectedPositionId]);
  }, [selectedPositionId]);

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
      }
    }
  }, [available, displayBalance, enqueueSnackbar, selectedPositions, setValue, type]);

  // check if available to withdraw is zero and disable button
  useEffect(() => {
    if (Number(available) === 0) {
      setBalanceInsufficient(true);
    } else {
      setBalanceInsufficient(false);
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
      const availableBalance = ethers.utils.parseEther(swETHBalance?.toFixed(0).split('.')[0]);
      setAvailable(ethers.utils.formatEther(availableBalance.div(BigNumber.from(selectedPositions.length))));
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
      const getMinimumBalance = Math.min(...(allPositionsBalances.length > 0 ? allPositionsBalances : [0]));
      setDisplayBalance(getMinimumBalance.toString());
      setAvailable(getMinimumBalance.toString());
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
    dispatch(setIsSwETHApprovalInProgress(true));
    setApprovalInProgress(true);
    try {
      if (swETHContract && chainId && watchAmount && watchAmount !== '') {
        const requiredAllowance = ethers.utils.parseEther(watchAmount.toString()).mul(selectedPositions.length);
        await swETHContract.estimateGas.approve(SWNFT_ADDRESS[chainId], requiredAllowance);
        const tx = await swETHContract.approve(SWNFT_ADDRESS[chainId], requiredAllowance);
        const receipt = await tx.wait();
        setApproved(!!receipt.status);
        if (receipt.status) {
          enqueueSnackbar('Approval successful', { variant: 'success' });
        } else if (library) {
          const transactionResponse = await library.getTransaction(receipt.transactionHash);
          if (transactionResponse) {
            await library.call(transactionResponse, transactionResponse.blockNumber);
          }
        } else {
          enqueueSnackbar('Approval unsuccessful', { variant: 'error' });
        }
      }
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    } finally {
      setApprovalInProgress(false);
      dispatch(setIsSwETHApprovalInProgress(false));
    }
  };

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
          Available to {type === LiquidityTransactionType.DEPOSIT ? 'deposit' : 'withdraw'}
          <span>
            <SwellIcon size="xs" />
            {displayBalance ?? '0.00'}
          </span>
        </Row>
        <PriceInput
          adornmentType="node"
          icon="swell"
          maxAmount={BigNumber.from(available.split('.')[0])}
          name="amount"
          required
          sx={{ marginTop: '24px' }}
          tooltip="Must be at least 1 swETH and must be an integer(whole number)"
        />
        {/* eslint-disable-next-line no-nested-ternary */}
        {account ? (
          isApproved ? (
            <LoadingButton
              disabled={
                true ||
                (type === LiquidityTransactionType.DEPOSIT ? isDepositInProgress : isWithdrawalInProgress) ||
                isSubmitting ||
                isBalanceInsufficient
              }
              fullWidth
              loading={
                (type === LiquidityTransactionType.DEPOSIT ? isDepositInProgress : isWithdrawalInProgress) ||
                isSubmitting
              }
              sx={{ color: theme.palette.grey.A400, marginBottom: '10px', textTransform: 'none' }}
              type="submit"
              variant="contained"
            >
              {type === LiquidityTransactionType.DEPOSIT ? 'Add Liquidity' : 'Remove Liquidity'}
            </LoadingButton>
          ) : (
            <LoadingButton
              disabled={true || isSwETHApprovalInProgress || isApprovalInProgress || isBalanceInsufficient}
              fullWidth
              loading={isSwETHApprovalInProgress || isApprovalInProgress}
              onClick={approveHandler}
              size="large"
              sx={{ color: theme.palette.grey.A400 }}
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

export default LiquidityTransaction;
