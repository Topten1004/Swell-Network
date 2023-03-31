import { FC, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Button, useTheme } from '@mui/material';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { useWeb3React } from 'web3-react-core';

import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { setIsNodeOperatorModalOpen, setIsWalletModalOpen } from '../../state/modal/modalSlice';

interface IProps {
  watchField: string;
  ethBalance: CurrencyAmount<Currency> | undefined;
}

// eslint-disable-next-line import/prefer-default-export
export const StakeButtons: FC<IProps> = ({ watchField, ethBalance }) => {
  const theme = useTheme();
  const { account } = useWeb3React();
  const dispatch = useAppDispatch();
  const { selectedNodeOperator } = useAppSelector((state) => state.nodeOperator);
  const {
    watch,
    formState: { isSubmitting },
  } = useFormContext();
  let amount = Number(watch(watchField));
  const [isBalanceInsufficient, setIsBalanceInsufficient] = useState(false);
  if (amount === null || amount === undefined || typeof amount === 'string') {
    amount = 0;
  }
  useEffect(() => {
    if (account && ethBalance && amount >= 0) {
      const parsedEthBalance = ethers.utils.parseEther(ethBalance?.toSignificant());
      const parsedAmount = ethers.utils.parseEther(amount.toString());
      if (parsedEthBalance.lt(parsedAmount)) {
        setIsBalanceInsufficient(true);
      } else {
        setIsBalanceInsufficient(false);
      }
    }
  }, [account, amount, ethBalance]);

  return (
    <>
      {/* eslint-disable-next-line no-nested-ternary */}
      {account ? (
        !selectedNodeOperator ? (
          <Button
            fullWidth
            onClick={() => dispatch(setIsNodeOperatorModalOpen(true))}
            sx={{ marginBottom: '20px', color: theme.palette.grey.A400 }}
            variant="contained"
          >
            Select a Node Operator
          </Button>
        ) : (
          <LoadingButton
            disabled={isSubmitting || isBalanceInsufficient || selectedNodeOperator === null}
            fullWidth
            loading={isSubmitting}
            sx={{ marginBottom: '20px', color: theme.palette.grey.A400 }}
            type="submit"
            variant="contained"
          >
            Stake
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
    </>
  );
};
