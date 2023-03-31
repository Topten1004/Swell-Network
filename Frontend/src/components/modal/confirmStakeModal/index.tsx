/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import { useLazyQuery } from '@apollo/client';
import { LoadingButton } from '@mui/lab';
import { Box, Button, CircularProgress } from '@mui/material';
import { ethers } from 'ethers';
import { useSnackbar } from 'notistack';

import { DEFAULT_REFERRAL } from '../../../constants/misc';
import useActiveWeb3React from '../../../hooks/useActiveWeb3React';
import { useSwNftContract } from '../../../hooks/useContract';
import { GET_DEPOSIT_DATAS_BY_NODE_OPERATOR, GET_DEPOSIT_DATAS_BY_VALIDATOR } from '../../../shared/graphql';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setIsConfirmStakeModalOpen } from '../../../state/modal/modalSlice';
import { StakingPage } from '../../../state/stake/stakeSlice';
import {
  setIsDepositEthereumInProgress,
  setIsStakingInProgress,
} from '../../../state/transactionProgress/transactionProgressSlice';
import { EthereumIcon, List, ListColumn, Modal, SwellIcon } from '../../../theme/uiComponents';
import { displayErrorMessage } from '../../../utils/errors';
import getAPR from '../../../utils/getAPR';
import { getEthPrice } from '../../../utils/price';

/*
// @TODO
create redux store for open modal
store wallet data into redux store
*/

export interface INodeOperatorCredentials {
  pubKey: string;
  signature: string;
  depositDataRoot: string;
  amount: ethers.BigNumber;
}

const ConfirmStakeModal: FC = () => {
  const { account, library } = useActiveWeb3React();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { nodeOperatorId } = useParams();
  const referralCode = new URLSearchParams(search).get('referralCode');

  const { enqueueSnackbar } = useSnackbar();
  const { isConfirmStakeModalOpen } = useAppSelector((state) => state.modal);
  const { selectedPublicKey, isSubmissionComplete } = useAppSelector((state) => state.registerEthDo);
  const { amount, page } = useAppSelector((state) => state.stake);
  const { APR, GetAPRError, loadingAPR } = useAppSelector((state) => state.stats);
  const dispatch = useAppDispatch();
  const swNFTContract = useSwNftContract();
  const [fee, setFee] = useState<number>(0);
  const [isDisabled, setDisabled] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [currentNodeOperatorId, setCurrentNodeOperatorId] = useState<number>();
  const [nodeOperatorCredentials, setNodeOperatorCredentials] = useState<INodeOperatorCredentials[]>([]);
  const [fetchDepositDatasByNodeOperator] = useLazyQuery(GET_DEPOSIT_DATAS_BY_NODE_OPERATOR);
  const [fetchDepositDatasByValidator, { loading, error: fetchingError, data: fetchedDepositData }] =
    useLazyQuery(GET_DEPOSIT_DATAS_BY_VALIDATOR);

  useEffect(() => {
    if (!loading && !fetchingError && page === StakingPage.DEPOSIT_ETHEREUM) {
      fetchDepositDatasByValidator({
        variables: {
          pubKey: selectedPublicKey,
          amount: amount?.toString(),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDepositDatasByValidator]);
  const { selectedNodeOperator } = useAppSelector((state) => state.nodeOperator);
  const { isDepositEthereumInProgress, isStakingInProgress } = useAppSelector((state) => state.transactionProgress);

  // node operator id
  useEffect(() => {
    if (page === StakingPage.DEPOSIT_ETHEREUM) {
      if (nodeOperatorId) {
        setCurrentNodeOperatorId(parseInt(nodeOperatorId, 10));
      } else {
        navigate('/become-a-node-operator');
      }
    } else if (page === StakingPage.STAKE) {
      if (selectedNodeOperator && typeof selectedNodeOperator.id === 'number') {
        setCurrentNodeOperatorId(selectedNodeOperator.id);
      }
    }
  }, [page, nodeOperatorId, navigate, selectedNodeOperator]);

  // node operator credentials
  useEffect(() => {
    if (selectedPublicKey && page === StakingPage.DEPOSIT_ETHEREUM && amount) {
      setLoading(true);
      if (fetchedDepositData && fetchedDepositData.depositDatasByValidator.length > 0) {
        setLoading(false);
        setNodeOperatorCredentials([
          {
            pubKey: selectedPublicKey,
            signature: fetchedDepositData.depositDatasByValidator[0].signature,
            depositDataRoot: fetchedDepositData.depositDatasByValidator[0].depositDataRoot,
            amount: ethers.utils.parseEther(fetchedDepositData.depositDatasByValidator[0].amount),
          },
        ]);
      }
    } else if (typeof currentNodeOperatorId === 'number' && amount) {
      setLoading(true);
      fetchDepositDatasByNodeOperator({
        variables: {
          id: currentNodeOperatorId,
          amount: amount.toString(),
        },

        onCompleted({ depositDatasByNodeOperator: depositDatas }) {
          setLoading(false);
          if (depositDatas && depositDatas.length > 0) {
            if (page === StakingPage.STAKE) {
              const selectedDepositDatas = [];
              for (let i = 0; i < depositDatas.length; i += 1) {
                if (!depositDatas[i]) throw new Error('Deposit data not available');
                selectedDepositDatas.push({
                  pubKey: depositDatas[i].validator.pubKey,
                  signature: depositDatas[i].signature,
                  depositDataRoot: depositDatas[i].depositDataRoot,
                  amount: ethers.utils.parseEther(depositDatas[i].amount),
                });
              }
              // eslint-disable-next-line prefer-destructuring
              setNodeOperatorCredentials(selectedDepositDatas);
            } else if (page === StakingPage.DEPOSIT_ETHEREUM) {
              if (selectedPublicKey && isSubmissionComplete) {
                const selectedDepositData = depositDatas.find(
                  (depositData: { validator: { pubKey: string }; amount: string }) =>
                    depositData.validator.pubKey === selectedPublicKey && depositData.amount === amount.toString()
                );
                if (selectedDepositData) {
                  setNodeOperatorCredentials([
                    {
                      pubKey: selectedDepositData.validator.pubKey,
                      signature: selectedDepositData.signature,
                      depositDataRoot: selectedDepositData.depositDataRoot,
                      amount: selectedDepositData.amount,
                    },
                  ]);
                } else {
                  throw new Error('Deposit data not available');
                }
              } else {
                enqueueSnackbar('Deposit data incomplete', { variant: 'error' });
                dispatch(setIsConfirmStakeModalOpen(false));
                navigate(`/register-with-ethdo/${nodeOperatorId}`);
              }
            }
          } else {
            throw new Error('Deposit data not available');
          }
        },
        onError(error) {
          setLoading(false);
          setDisabled(true);
          enqueueSnackbar(error.message, { variant: 'error' });
        },
      });
    }
  }, [
    amount,
    currentNodeOperatorId,
    dispatch,
    enqueueSnackbar,
    fetchDepositDatasByNodeOperator,
    isSubmissionComplete,
    navigate,
    nodeOperatorId,
    page,
    selectedPublicKey,
    fetchedDepositData,
  ]);

  const calculateTransactionFee = useCallback(async () => {
    if (nodeOperatorCredentials.length === 0) {
      setDisabled(true);
      return;
    }
    setLoading(true);
    try {
      if (swNFTContract && amount && library && nodeOperatorCredentials) {
        const stakeAmount = ethers.utils.parseEther(amount.toString());
        const gasPrice = ethers.utils.formatUnits(await library.getGasPrice(), 'ether');
        const estimate = await swNFTContract.estimateGas.stake(
          nodeOperatorCredentials,
          referralCode || DEFAULT_REFERRAL,
          {
            value: stakeAmount,
          }
        );
        const gasUnits = parseInt(
          // eslint-disable-next-line no-underscore-dangle
          estimate._hex,
          16
        );
        const transactionFee = parseFloat(gasPrice) * gasUnits;
        const ethPriceInUSD = await getEthPrice();
        const transactionFeeInUSD = Number((transactionFee * ethPriceInUSD).toFixed(2));
        setFee(transactionFeeInUSD);
        setDisabled(false);
        setLoading(false);
      }
    } catch (error: any) {
      displayErrorMessage(enqueueSnackbar, error);
      setDisabled(true);
      setLoading(false);
    }
  }, [amount, enqueueSnackbar, library, nodeOperatorCredentials, referralCode, swNFTContract]);

  const confirmStakeHandler = async () => {
    if (page === StakingPage.DEPOSIT_ETHEREUM) {
      dispatch(setIsDepositEthereumInProgress(true));
    } else if (page === StakingPage.STAKE) {
      dispatch(setIsStakingInProgress(true));
    }
    setLoading(true);

    try {
      if (account && amount && swNFTContract && nodeOperatorCredentials) {
        const stakeAmount = ethers.utils.parseEther(amount.toString());
        // --- Disable skip estimateGas as it's already done in calculateTransactionFee
        // await swNFTContract.estimateGas.stake(nodeOperatorCredentials, referralCode || DEFAULT_REFERRAL, {
        //   value: stakeAmount,
        // });
        const tx = await swNFTContract.stake(nodeOperatorCredentials, referralCode || DEFAULT_REFERRAL, {
          value: stakeAmount,
        });
        const receipt = await tx.wait();
        if (receipt.status) {
          enqueueSnackbar('Staking successful', { variant: 'success' });
          dispatch(setIsConfirmStakeModalOpen(false));
          if (pathname.split('/')[1] === 'deposit-ethereum') {
            navigate('/');
          } else if (receipt?.events?.length > 0) {
            const event = receipt.events.find((e: { event: string }) => e.event === 'Transfer');
            if (event?.args) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const [from, to, value] = event.args;
              const newTokenId = value?.toString();
              if (newTokenId) {
                navigate(`/position/${newTokenId}`);
              }
            }
          }
        } else if (library) {
          const transactionResponse = await library.getTransaction(receipt.transactionHash);
          if (transactionResponse) {
            const transaction: any =
              transactionResponse.type === null ? { ...transactionResponse, type: undefined } : transactionResponse;
            await library.call(transaction, transaction.blockNumber);
          }
        } else {
          enqueueSnackbar('Staking unsuccessful', { variant: 'error' });
        }
      }
      setLoading(false);
    } catch (error) {
      setDisabled(true);
      setLoading(false);
      displayErrorMessage(enqueueSnackbar, error);
    } finally {
      if (page === StakingPage.DEPOSIT_ETHEREUM) {
        dispatch(setIsDepositEthereumInProgress(false));
      } else if (page === StakingPage.STAKE) {
        dispatch(setIsStakingInProgress(false));
      }
    }
  };

  useEffect(() => {
    calculateTransactionFee();
  }, [calculateTransactionFee]);

  return (
    <Modal
      maxWidth="sm"
      onClose={() => dispatch(setIsConfirmStakeModalOpen(false))}
      open={isConfirmStakeModalOpen}
      sx={{
        '& .MuiDialogTitle-root,  & .MuiDialogContent-root': {
          paddingInline: {
            sm: '38px',
          },
        },
        '& .MuiDialogTitle-root button': {
          right: { sm: '20px' },
        },
      }}
      title="Confirm Stake"
    >
      <Box
        sx={{
          borderRadius: '15px',
          fontWeight: 500,
          fontSize: 16.9,
          '& a': {
            color: 'inherit',
            fontWeight: 600,
            textDecoration: 'underline',
          },
        }}
      >
        <List sx={{ marginBottom: 0, div: { padding: 0, paddingInline: { sm: '7px' }, lineHeight: '3rem' } }}>
          <ListColumn>
            Amount staked
            <span>
              <EthereumIcon sx={{ height: 16, width: 16, marginRight: '5px' }} />
              {amount}
            </span>
          </ListColumn>
          <ListColumn>
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
          </ListColumn>
          <ListColumn>
            You will receive
            <span>
              <SwellIcon size="xs" />
              {amount}
            </span>
          </ListColumn>
          <ListColumn>
            Exchange rate <span>1 ETH = 1 swETH</span>
          </ListColumn>
          <ListColumn>
            Transaction cost <span>{`$ ${fee}`}</span>
          </ListColumn>
          <LoadingButton
            disabled={
              (page === StakingPage.DEPOSIT_ETHEREUM ? isDepositEthereumInProgress : isStakingInProgress) || isDisabled
            }
            fullWidth
            loading={
              (page === StakingPage.DEPOSIT_ETHEREUM ? isDepositEthereumInProgress : isStakingInProgress) || isLoading
            }
            onClick={confirmStakeHandler}
            sx={{ margin: '20px 0px 10px 0px' }}
            variant="contained"
          >
            Confirm
          </LoadingButton>
        </List>
      </Box>
    </Modal>
  );
};

export default ConfirmStakeModal;
