import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Button, styled, Theme } from '@mui/material';
import { BigNumber, ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { SWETH } from '../../constants/tokens';
import { useNativeCurrencyBalances, useTokenBalance } from '../../state/wallet/hooks';
import { displayErrorMessage } from '../../utils/errors';

interface IProps {
  inputName: string;
  currency: string;
  maxAmount?: BigNumber;
}

const Layout = styled('div')(({ theme }) => ({
  display: 'flex',
  '& button.active': {
    color: theme.palette.primary.main,
    background: theme.palette.primary.light,
  },
}));

const InputButtons: React.FC<IProps> = ({ inputName, currency, maxAmount }) => {
  const { setValue } = useFormContext();
  const { account, chainId } = useWeb3React();
  const { enqueueSnackbar } = useSnackbar();

  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[account ?? ''];
  const userSwETHBalance = useTokenBalance(account ?? undefined, chainId ? SWETH[chainId] : undefined);
  const handleButtonClick = (divisor = 1) => {
    try {
      let value = 0;
      if (maxAmount) {
        const newVal = Number(ethers.utils.formatEther(maxAmount));
        const computedValue = Math.floor(newVal / divisor);
        setValue(inputName, computedValue);
      } else {
        if (currency === 'eth' && userEthBalance) {
          const computedValue = ethers.utils
            .parseEther(userEthBalance.toFixed())
            .div(ethers.utils.parseEther(divisor.toString()));
          value = parseInt(
            // eslint-disable-next-line no-underscore-dangle
            computedValue._hex,
            16
          );
          if (value > 16) {
            value = 16;
          }
        }
        if (currency === 'swell' && userSwETHBalance) {
          value = parseInt(
            // eslint-disable-next-line no-underscore-dangle
            ethers.utils.parseEther(userSwETHBalance.toFixed()).div(ethers.utils.parseEther(divisor.toString()))._hex,
            16
          );
        }
        setValue(inputName, ethers.utils.formatEther(value));
      }
      // eslint-disable-next-line no-empty
    } catch (error: any) {
      displayErrorMessage(enqueueSnackbar, error);
    }
  };
  return (
    <Layout>
      <Button
        onClick={() => handleButtonClick(2)}
        sx={{
          color: (theme: Theme) => theme.palette.common.black,
          padding: '10px 14px',
          minWidth: 'unset',
          fontSize: '12px',
        }}
        variant="text"
      >
        50%
      </Button>
      <Button
        className="active"
        onClick={() => handleButtonClick()}
        sx={{
          color: (theme: Theme) => theme.palette.common.black,
          padding: '10px 14px',
          minWidth: 'unset',
          fontSize: '12px',
        }}
        variant="text"
      >
        MAX
      </Button>
    </Layout>
  );
};
export default InputButtons;
