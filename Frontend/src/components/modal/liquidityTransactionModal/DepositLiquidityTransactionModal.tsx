/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useLazyQuery } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { ZERO_ADDRESS } from '../../../constants/misc';
import { useSWETHContract, useSwNftContract } from '../../../hooks/useContract';
import { useV3Positions } from '../../../hooks/useV3Positions';
import { GET_NODE_OPERATOR_BY_VALIDATOR } from '../../../shared/graphql';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setIsDepositLiquidityTransactionModalOpen } from '../../../state/modal/modalSlice';
import { setIsBatchDepositInProgress } from '../../../state/transactionProgress/transactionProgressSlice';
import { Modal } from '../../../theme/uiComponents';
import { displayErrorMessage } from '../../../utils/errors';
import { useIsMounted } from '../../../utils/useIsMounted';
import { liquidityTransactionModalFormSchema as schema } from '../../../validations/liquidityTransactionModalFormSchema';
import MultiSelect from '../../common/MultiSelect';
import { BatchAction } from '../../liquidityTransaction/BatchAction';
import IOption from './IOption';
import LiquidityTransactionModal, { LiquidityTransactionType } from './LiquidityTransactionModal';

const DepositLiquidityTransactionModal: FC = () => {
  const isMounted = useIsMounted();
  const { account, chainId, library } = useWeb3React();
  const { isDepositLiquidityTransactionModalOpen } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const swNFTContract = useSwNftContract();
  const swETHContract = useSWETHContract();
  const method = useForm({
    mode: 'onSubmit',
    criteriaMode: 'all',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });
  const { handleSubmit } = method;
  const [options, setOptions] = useState<IOption[]>([]);
  const { positions, loading } = useV3Positions(account);
  const { enqueueSnackbar } = useSnackbar();
  const [fetchPositionData] = useLazyQuery(GET_NODE_OPERATOR_BY_VALIDATOR);

  const fetchData = (id: number) => {
    if (positions && id < positions?.length) {
      fetchPositionData({
        variables: {
          pubKey: positions[id].pubKey,
        },
        onCompleted(data) {
          const tempOptions = options;
          tempOptions[id] = {
            label:
              positions[id].tokenId.toString() +
              (data.nodeOperatorByValidator ? String(' - ') + data.nodeOperatorByValidator.name : ''),
            value: positions[id].tokenId.toString(),
            logo: data.nodeOperatorByValidator?.logo,
          };
          setOptions(tempOptions);
          setTimeout(() => {
            if (isMounted()) fetchData(id + 1);
          }, 0);
        },
      });
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchData(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const submitHandler = async (data: any) => {
    dispatch(setIsBatchDepositInProgress(true));
    try {
      if (
        account &&
        chainId &&
        swNFTContract &&
        swETHContract &&
        data &&
        data.amount &&
        data.amount !== '' &&
        data.positions &&
        data.positions.length > 0
      ) {
        const depositAmount = ethers.utils.parseEther(data.amount.toString());
        await swNFTContract.estimateGas.batchAction(
          data.positions.map((positionId: string) => ({
            tokenId: positionId,
            action: BatchAction.DEPOSIT,
            amount: depositAmount,
            strategy: ZERO_ADDRESS,
          }))
        );
        const tx = await swNFTContract.batchAction(
          data.positions.map((positionId: string) => ({
            tokenId: positionId,
            action: BatchAction.DEPOSIT,
            amount: depositAmount,
            strategy: ZERO_ADDRESS,
          }))
        );
        const receipt = await tx.wait();
        if (receipt.status) {
          dispatch(setIsDepositLiquidityTransactionModalOpen(false));
          enqueueSnackbar('Deposit successful', { variant: 'success' });
        } else if (library) {
          const transactionResponse = await library.getTransaction(receipt.transactionHash);
          if (transactionResponse) {
            await library.call(transactionResponse, transactionResponse.blockNumber);
          }
        } else {
          enqueueSnackbar('Deposit unsuccessful', { variant: 'error' });
        }
      }
    } catch (err) {
      displayErrorMessage(enqueueSnackbar, err);
    } finally {
      dispatch(setIsBatchDepositInProgress(false));
    }
  };

  return (
    // eslint-disable-next-line no-console
    <Modal
      maxWidth="sm"
      onClose={() => dispatch(setIsDepositLiquidityTransactionModalOpen(false))}
      open={isDepositLiquidityTransactionModalOpen}
      sx={{
        '& .MuiDialogContent-root': {
          paddingTop: 0,
          padding: {
            sm: '0px 28px 20px',
          },
        },
      }}
      title="Deposit Total Position"
    >
      <Typography component="p" sx={{ paddingBottom: 'unset', fontWeight: 500, paddingInline: '8px' }}>
        Choose positions to enter
      </Typography>

      <FormProvider {...method}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <MultiSelect name="positions" options={options} required />

          <Card
            sx={{
              border: (theme) => `2px solid ${theme.palette.grey[300]}`,
            }}
          >
            <LiquidityTransactionModal sx={{ '& > div': { padding: 0 } }} type={LiquidityTransactionType.DEPOSIT} />
          </Card>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default DepositLiquidityTransactionModal;
