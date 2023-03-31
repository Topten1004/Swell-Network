import { FC, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Card, useTheme } from '@mui/material';
import { ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { useSwNftContract } from '../../hooks/useContract';
import { useVaults } from '../../hooks/useVault';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { setIsVaultTransactionModalOpen } from '../../state/modal/modalSlice';
import {
  setIsBatchEnterStrategyInProgress,
  setIsBatchExitStrategyInProgress,
} from '../../state/transactionProgress/transactionProgressSlice';
import { displayErrorMessage } from '../../utils/errors';
import { vaultTransactionModalSchema } from '../../validations/vault-transaction-modal.schema';
import { VaultTransactionType } from '../common/ChoosePosition';
import InputController from '../common/InputController';
import { BatchAction } from '../liquidityTransaction/BatchAction';
import IOption from '../modal/liquidityTransactionModal/IOption';
import PrefillAmountInModalInput from './PrefillAmountInModalInput';
import RenderOptionsBasedOnStrategy from './RenderOptionsBasedOnStrategy';

interface VaultTransactionProps {
  type: VaultTransactionType;
}

const VaultTransactionModal: FC<VaultTransactionProps> = ({ type }) => {
  const theme = useTheme();
  const { library } = useWeb3React();
  const method = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(vaultTransactionModalSchema),
  });
  const dispatch = useAppDispatch();
  const { isBatchEnterStrategyInProgress, isBatchExitStrategyInProgress } = useAppSelector(
    (state) => state.transactionProgress
  );
  const { handleSubmit, watch, reset, setValue } = method;
  const { enqueueSnackbar } = useSnackbar();
  const swNFTContract = useSwNftContract();
  const [isPendingTransaction, setPendingTransaction] = useState(false);
  const { loading, vaults } = useVaults();

  let strategyId = watch('strategy');
  if (strategyId === '' || strategyId === undefined) {
    strategyId = 1;
  }

  const options: IOption[] =
    !loading && vaults ? vaults.map((vault, i) => ({ label: vault, value: i.toString() })) : [];

  const onEnterVaultBatchAction = async (data: any) => {
    dispatch(setIsBatchEnterStrategyInProgress(true));
    try {
      setPendingTransaction(true);
      if (
        swNFTContract &&
        data &&
        data.amount &&
        data.amount !== '' &&
        typeof data.strategy === 'number' &&
        data.positions &&
        data.positions.length > 0
      ) {
        const amount = ethers.utils.parseEther(data.amount.toString());
        await swNFTContract.estimateGas.batchAction(
          data.positions.map((positionId: string) => ({
            tokenId: positionId,
            action: BatchAction.ENTER,
            amount,
            strategy: vaults[data.strategy],
          }))
        );
        const tx = await swNFTContract.batchAction(
          data.positions.map((positionId: string) => ({
            tokenId: positionId,
            action: BatchAction.ENTER,
            amount,
            strategy: vaults[data.strategy],
          }))
        );
        const receipt = await tx.wait();
        if (receipt.status) {
          reset();
          setValue('amount', '');
          dispatch(setIsVaultTransactionModalOpen(false));
          enqueueSnackbar('Transaction successful', { variant: 'success' });
        } else if (library) {
          const transactionResponse = await library.getTransaction(receipt.transactionHash);
          if (transactionResponse) {
            await library.call(transactionResponse, transactionResponse.blockNumber);
          }
        } else {
          enqueueSnackbar('Transaction unsuccessful', { variant: 'error' });
        }
      }
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    } finally {
      setPendingTransaction(false);
      dispatch(setIsBatchEnterStrategyInProgress(false));
    }
  };
  const onExitVaultBatchAction = async (data: any) => {
    dispatch(setIsBatchExitStrategyInProgress(true));
    try {
      setPendingTransaction(true);
      if (
        swNFTContract &&
        data &&
        data.amount &&
        data.amount !== '' &&
        typeof data.strategy === 'number' &&
        data.positions &&
        data.positions.length > 0
      ) {
        const amount = ethers.utils.parseEther(data.amount.toString());
        await swNFTContract.estimateGas.batchAction(
          data.positions.map((positionId: string) => ({
            tokenId: positionId,
            action: BatchAction.EXIT,
            amount,
            strategy: vaults[data.strategy],
          }))
        );
        const tx = await swNFTContract.batchAction(
          data.positions.map((positionId: string) => ({
            tokenId: positionId,
            action: BatchAction.EXIT,
            amount,
            strategy: vaults[data.strategy],
          }))
        );
        const receipt = await tx.wait();
        if (receipt.status) {
          reset();
          setValue('amount', undefined);
          dispatch(setIsVaultTransactionModalOpen(false));
          enqueueSnackbar('Transaction successful', { variant: 'success' });
        } else if (library) {
          const transactionResponse = await library.getTransaction(receipt.transactionHash);
          if (transactionResponse) {
            await library.call(transactionResponse, transactionResponse.blockNumber);
          }
        } else {
          enqueueSnackbar('Transaction unsuccessful', { variant: 'error' });
        }
      }
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    } finally {
      setPendingTransaction(false);
      dispatch(setIsBatchExitStrategyInProgress(false));
    }
  };
  const onSubmit = (data: any) => {
    if (type === VaultTransactionType.ENTER) {
      onEnterVaultBatchAction(data);
    } else {
      onExitVaultBatchAction(data);
    }
  };

  return (
    <Card
      sx={{
        padding: '22px',
        width: '100%',
      }}
    >
      <FormProvider {...method}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputController label="Choose vault" name="strategy" options={options} placeholder="Choose vault" select />
          <RenderOptionsBasedOnStrategy strategyId={Number(strategyId) ?? 1} type={type} />
          <PrefillAmountInModalInput strategyId={Number(strategyId) ?? 1} type={type} />
          <LoadingButton
            disabled={
              (type === VaultTransactionType.ENTER ? isBatchEnterStrategyInProgress : isBatchExitStrategyInProgress) ||
              isPendingTransaction
            }
            fullWidth
            loading={
              (type === VaultTransactionType.ENTER ? isBatchEnterStrategyInProgress : isBatchExitStrategyInProgress) ||
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

export default VaultTransactionModal;
