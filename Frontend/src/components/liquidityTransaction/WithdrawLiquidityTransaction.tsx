import { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router';

import { yupResolver } from '@hookform/resolvers/yup';
import { ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { useSwNftContract } from '../../hooks/useContract';
import { useAppDispatch } from '../../state/hooks';
import { setIsWithdrawalInProgress } from '../../state/transactionProgress/transactionProgressSlice';
import { displayErrorMessage } from '../../utils/errors';
import { liquidityTransactionFormSchema as schema } from '../../validations/liquidityTransactionFormSchema';
import LiquidityTransaction, { LiquidityTransactionType } from './LiquidityTransaction';

// eslint-disable-next-line import/prefer-default-export
export const WithdrawLiquidityTransaction: FC = () => {
  const { library } = useWeb3React();

  const method = useForm({
    mode: 'onSubmit',
    criteriaMode: 'all',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    resolver: yupResolver(schema),
  });
  const { handleSubmit, reset } = method;
  const swNFTContract = useSwNftContract();
  const { id: selectedPositionId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const submitHandler = async (data: any) => {
    dispatch(setIsWithdrawalInProgress(true));
    try {
      if (data && data.amount && swNFTContract) {
        const withdrawAmount = ethers.utils.parseEther(data.amount.toString());
        await swNFTContract.estimateGas.withdraw(selectedPositionId, withdrawAmount);
        const tx = await swNFTContract.withdraw(selectedPositionId, withdrawAmount);
        const receipt = await tx.wait();
        if (receipt.status) {
          enqueueSnackbar('Withdrawal successful', { variant: 'success' });
          reset({ amount: '' });
        } else if (library) {
          const transactionResponse = await library.getTransaction(receipt.transactionHash);
          if (transactionResponse) {
            await library.call(transactionResponse, transactionResponse.blockNumber);
          }
        } else {
          enqueueSnackbar('Withdrawal unsuccessful', { variant: 'error' });
        }
      }
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    } finally {
      dispatch(setIsWithdrawalInProgress(false));
    }
  };
  return (
    <FormProvider {...method}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <LiquidityTransaction type={LiquidityTransactionType.WITHDRAW} />
      </form>
    </FormProvider>
  );
};
