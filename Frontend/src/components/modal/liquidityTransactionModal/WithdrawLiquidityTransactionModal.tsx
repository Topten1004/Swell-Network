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
import { useSwNftContract } from '../../../hooks/useContract';
import { useV3Positions } from '../../../hooks/useV3Positions';
import { GET_NODE_OPERATOR_BY_VALIDATOR } from '../../../shared/graphql';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setIsWithdrawLiquidityTransactionModalOpen } from '../../../state/modal/modalSlice';
import { setIsBatchWithdrawlInProgress } from '../../../state/transactionProgress/transactionProgressSlice';
import { Modal, SwellIcon } from '../../../theme/uiComponents';
import { displayErrorMessage } from '../../../utils/errors';
import { useIsMounted } from '../../../utils/useIsMounted';
import { liquidityTransactionModalFormWithdrawSchema as schema } from '../../../validations/liquidityTransactionModalFormSchema';
import MultiSelect from '../../common/MultiSelect';
import { BatchAction } from '../../liquidityTransaction/BatchAction';
import IOption from './IOption';
import LiquidityTransactionModal, { LiquidityTransactionType } from './LiquidityTransactionModal';

const WithdrawLiquidityTransactionModal: FC = () => {
  const isMounted = useIsMounted();
  const { account, library } = useWeb3React();
  const method = useForm({
    mode: 'onSubmit',
    criteriaMode: 'all',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });
  const swNFTContract = useSwNftContract();
  const { enqueueSnackbar } = useSnackbar();

  const { isWithdrawLiquidityTransactionModalOpen } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const { handleSubmit } = method;
  const { positions, loading } = useV3Positions(account);

  const submitHandler = async (data: any) => {
    dispatch(setIsBatchWithdrawlInProgress(true));
    try {
      if (account && swNFTContract && data && data.positions && data.positions.length > 0) {
        const tx = await swNFTContract.batchAction(
          data.positions.map((positionId: string) => {
            const position = (positions || []).find(({ tokenId }) => tokenId.toString() === positionId);
            const withdrawAmount = position?.baseTokenBalance || '0';
            return {
              tokenId: positionId,
              action: BatchAction.WITHDRAW,
              amount: withdrawAmount,
              strategy: ZERO_ADDRESS,
            };
          })
        );
        const receipt = await tx.wait();
        if (receipt.status) {
          dispatch(setIsWithdrawLiquidityTransactionModalOpen(false));
          enqueueSnackbar('Withdrawal successful', { variant: 'success' });
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
      dispatch(setIsBatchWithdrawlInProgress(false));
    }
  };

  const [fetchPositionData] = useLazyQuery(GET_NODE_OPERATOR_BY_VALIDATOR);
  const [options, setOptions] = useState<IOption[]>([]);

  const stakedPositions = positions?.filter(
    ({ baseTokenBalance }) => Number(ethers.utils.formatEther(baseTokenBalance)) > 0
  );

  const fetchData = (id: number) => {
    if (stakedPositions && id < stakedPositions?.length) {
      fetchPositionData({
        variables: {
          pubKey: stakedPositions[id].pubKey,
        },
        onCompleted(data) {
          const tempOptions = options;
          tempOptions[id] = {
            label:
              stakedPositions[id].tokenId.toString() +
              (data.nodeOperatorByValidator ? String(' - ') + data.nodeOperatorByValidator.name : ''),
            value: stakedPositions[id].tokenId.toString(),
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

  return (
    // eslint-disable-next-line no-console
    <Modal
      icon={<SwellIcon size="sm" />}
      maxWidth="sm"
      onClose={() => dispatch(setIsWithdrawLiquidityTransactionModalOpen(false))}
      open={isWithdrawLiquidityTransactionModalOpen}
      title="Withdraw Total Position"
    >
      <Typography component="p" sx={{ paddingBottom: 'unset', fontWeight: 500, paddingInline: '8px' }}>
        Choose positions to exit
      </Typography>
      <FormProvider {...method}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <MultiSelect name="positions" options={options} required />
          <Card
            sx={{
              border: (theme) => `2px solid ${theme.palette.grey[300]}`,
            }}
          >
            <LiquidityTransactionModal sx={{ '& > div': { padding: 0 } }} type={LiquidityTransactionType.WITHDRAW} />
          </Card>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default WithdrawLiquidityTransactionModal;
