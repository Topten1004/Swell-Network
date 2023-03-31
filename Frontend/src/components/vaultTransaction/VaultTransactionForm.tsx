import { FC, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router';

import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Card, useTheme } from '@mui/material';
import { ethers } from 'ethers';
import { useSnackbar } from 'notistack';

import { useSwNftContract } from '../../hooks/useContract';
import { useStrategiesAddress } from '../../hooks/useVault';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import {
  setIsEnterStrategyInProgress,
  setIsExitStrategyInProgress,
} from '../../state/transactionProgress/transactionProgressSlice';
import { displayErrorMessage } from '../../utils/errors';
import { vaultTransactionSchema } from '../../validations/vault-transaction.schema';
import ChoosePosition from '../common/ChoosePosition';
import { PrepopulateInputBasedOnSelectedPosition } from './PrepolulateInputBasedOnSelectedPosition';

export enum VaultTransactionType {
  ENTER = 'ENTER',
  EXIT = 'EXIT',
}

interface VaultTransactionProps {
  type: VaultTransactionType;
}

const VaultTransaction: FC<VaultTransactionProps> = ({ type }) => {
  const theme = useTheme();
  const method = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(vaultTransactionSchema),
  });
  const { index } = useParams<{ index: string }>();
  const { strategies } = useStrategiesAddress(Number(index) - 1);
  const { handleSubmit, reset, setValue } = method;
  const { enqueueSnackbar } = useSnackbar();
  const swNFTContract = useSwNftContract();
  const [isPendingTransaction, setPendingTransaction] = useState(false);
  const dispatch = useAppDispatch();
  const { isEnterStrategyInProgress, isExitStrategyInProgress } = useAppSelector((state) => state.transactionProgress);

  const onEnterVault = async (data: any) => {
    dispatch(setIsEnterStrategyInProgress(true));
    try {
      if (data && data.amount && swNFTContract) {
        setPendingTransaction(true);
        const amount = ethers.utils.parseUnits(data.amount.toString());
        await swNFTContract.estimateGas.enterStrategy(data.position.name, strategies[0], amount, 0);
        const tx = await swNFTContract.enterStrategy(data.position.name, strategies[0], amount, 0);
        const receipt = await tx.wait();
        if (receipt.status) {
          reset();
          setValue('amount', '');
          enqueueSnackbar('Transaction successful', { variant: 'success' });
        } else {
          enqueueSnackbar('Transaction failed', { variant: 'error' });
        }
      }
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    } finally {
      setPendingTransaction(false);
      dispatch(setIsEnterStrategyInProgress(false));
    }
  };
  const onExitVault = async (data: any) => {
    dispatch(setIsExitStrategyInProgress(true));
    try {
      if (data && data.amount && swNFTContract) {
        setPendingTransaction(true);
        const amount = ethers.utils.parseEther(data.amount.toString());
        await swNFTContract.estimateGas.exitStrategy(data.position.name, strategies[0], amount, 0);
        const tx = await swNFTContract.exitStrategy(data.position.name, strategies[0], amount, 0);
        const receipt = await tx.wait();
        if (receipt.status) {
          reset();
          setValue('amount', '');
          enqueueSnackbar('Transaction successful', { variant: 'success' });
        } else {
          enqueueSnackbar('Transaction failed', { variant: 'error' });
        }
      }
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    } finally {
      setPendingTransaction(false);
      dispatch(setIsExitStrategyInProgress(false));
    }
  };
  const onSubmit = (data: any) => {
    if (type === VaultTransactionType.ENTER) {
      onEnterVault(data);
    } else {
      onExitVault(data);
    }
  };

  return (
    <Card
      sx={{
        padding: {
          xs: '22px 0',
          sm: '22px 15px',
          lg: '22px',
        },
        width: '100%',
      }}
    >
      <FormProvider {...method}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ChoosePosition
            name="position"
            placeholder={type === VaultTransactionType.ENTER ? 'Choose position to enter' : 'Choose position to exit'}
            vaultTransactionType={type}
          />
          <PrepopulateInputBasedOnSelectedPosition
            adornmentType="node"
            icon="swell"
            name="amount"
            tooltip="Must be at least 1 swETH and must be an integer(whole number)"
            watchField="position"
          />
          <LoadingButton
            disabled={
              (type === VaultTransactionType.ENTER ? isEnterStrategyInProgress : isExitStrategyInProgress) ||
              isPendingTransaction
            }
            fullWidth
            loading={
              (type === VaultTransactionType.ENTER ? isEnterStrategyInProgress : isExitStrategyInProgress) ||
              isPendingTransaction
            }
            sx={{ color: theme.palette.grey.A400, marginBottom: '20px', textTransform: 'none' }}
            type="submit"
            variant="contained"
          >
            {type === VaultTransactionType.ENTER ? 'Enter vault' : 'Exit vault'}
          </LoadingButton>
        </form>
      </FormProvider>
    </Card>
  );
};

export default VaultTransaction;
