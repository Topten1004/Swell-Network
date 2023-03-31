import { FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { useSwNftContract } from '../../hooks/useContract';
import { displayErrorMessage } from '../../utils/errors';
import InputController from '../common/InputController';

// eslint-disable-next-line import/prefer-default-export
export const OperatorRate: FC = () => {
  const { account, library } = useWeb3React();
  const {
    watch,
    formState: { isSubmitting },
  } = useFormContext();
  const rate = watch('rate') === '' ? '' : Number(watch('rate'));
  const [isUpdatingOpRate, setIsUpdatingOpRate] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const swNFTContract = useSwNftContract();

  const handleSetRate = async () => {
    setIsUpdatingOpRate(true);
    try {
      if (swNFTContract && rate !== '') {
        await swNFTContract.estimateGas.updateOpRate(rate);
        const tx = await swNFTContract.updateOpRate(rate);
        const receipt = await tx.wait();
        if (receipt.status) {
          enqueueSnackbar('Successfully updated Operator rate', { variant: 'success' });
        } else if (library) {
          const transactionResponse = await library.getTransaction(receipt.transactionHash);
          if (transactionResponse) {
            await library.call(transactionResponse, transactionResponse.blockNumber);
          }
        } else {
          enqueueSnackbar('Unable to update Operator rate', { variant: 'error' });
        }
      }
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    } finally {
      setIsUpdatingOpRate(false);
    }
  };
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
      <InputController label="Rate" name="rate" numberFormat placeholder="Rate" />
      <LoadingButton
        disabled={!account || rate === '' || isSubmitting || isUpdatingOpRate}
        loading={isUpdatingOpRate}
        onClick={handleSetRate}
        sx={{ marginBottom: '15px', minWidth: '135px', minHeight: '50px' }}
        variant="contained"
      >
        Set Rate
      </LoadingButton>
    </Box>
  );
};
