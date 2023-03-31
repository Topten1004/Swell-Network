import { FC } from 'react';

import { Button, MenuItem, Select, SxProps, Theme, useMediaQuery, useTheme } from '@mui/material';
import { ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import { UnsupportedChainIdError, useWeb3React } from 'web3-react-core';

import { useAppDispatch } from '../../state/hooks';
import { setIsWalletModalOpen } from '../../state/modal/modalSlice';
import { switchToNetwork } from '../../utils/switchToNetwork';

interface IProps {
  buttonStyle?: SxProps<Theme>;
  showNetworkSelectionDropDown?: boolean;
  showSwitchNetwork?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const KALEIDO_CHAIN_ID = process.env.REACT_APP_KALEIDO_CHAIN_ID;
if (typeof KALEIDO_CHAIN_ID === 'undefined') {
  throw new Error(`REACT_APP_KALEIDO_CHAIN_ID must be a defined environment variable`);
}
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const DEFAULT_NETWORK_MOBILE = process.env.REACT_APP_DEFAULT_NETWORK_MOBILE;
if (typeof DEFAULT_NETWORK_MOBILE === 'undefined') {
  throw new Error(`REACT_APP_DEFAULT_NETWORK_MOBILE must be a defined environment variable`);
}
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const DEFAULT_NETWORK_DESKTOP = process.env.REACT_APP_DEFAULT_NETWORK_DESKTOP;
if (typeof DEFAULT_NETWORK_DESKTOP === 'undefined') {
  throw new Error(`REACT_APP_DEFAULT_NETWORK_DESKTOP must be a defined environment variable`);
}

// eslint-disable-next-line import/prefer-default-export
export const SelectNetwork: FC<IProps> = ({
  buttonStyle = {},
  showNetworkSelectionDropDown = false,
  showSwitchNetwork = false,
}) => {
  const { account, error, library, chainId } = useWeb3React();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobileOrTab = useMediaQuery(`(max-width:${theme.breakpoints.values.lg}px)`);

  const handleChainSwitch = async (
    targetChainId = isMobileOrTab ? Number(DEFAULT_NETWORK_MOBILE) : Number(DEFAULT_NETWORK_DESKTOP)
  ) => {
    try {
      if (library && targetChainId) {
        await switchToNetwork({ library, chainId: targetChainId });
      } else if (!library && targetChainId) {
        let web3Provider;
        if (window.ethereum) {
          // eslint-disable-next-line no-new
          web3Provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        } else if (window.web3) {
          // eslint-disable-next-line no-new
          web3Provider = new ethers.providers.Web3Provider(window.web3, 'any');
        }
        if (web3Provider) {
          await switchToNetwork({ library: web3Provider, chainId: targetChainId });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-shadow
    } catch (error: any) {
      enqueueSnackbar(`Failed to switch networks: ${error.message}`, { variant: 'error' });
    }
  };
  const handleChange = (e: any) => {
    handleChainSwitch(e.target.value);
  };

  return (
    <>
      {!isMobileOrTab && showNetworkSelectionDropDown && (
        <Select
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
          onChange={handleChange}
          sx={{
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                border: 0,
              },
            },
          }}
          value={chainId || Number(KALEIDO_CHAIN_ID)}
        >
          <MenuItem value={1}>Ethereum</MenuItem>
          <MenuItem value={5}>Görli</MenuItem>
          <MenuItem value={Number(KALEIDO_CHAIN_ID)}>Kaleido</MenuItem>
        </Select>
      )}

      {/* eslint-disable-next-line no-nested-ternary */}
      {(!account && error) || showSwitchNetwork ? (
        isMobileOrTab ? (
          <Button color="error" onClick={() => dispatch(setIsWalletModalOpen(true))}>
            {error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}
          </Button>
        ) : (
          <Button color="error" onClick={() => handleChainSwitch()} sx={buttonStyle}>
            {error instanceof UnsupportedChainIdError || showSwitchNetwork ? 'Switch Network' : 'Error'}
          </Button>
        )
      ) : (
        <></>
      )}
      {!account && !error && (
        <Button color="info" onClick={() => dispatch(setIsWalletModalOpen(true))} sx={buttonStyle}>
          Connect wallet
        </Button>
      )}
    </>
  );
};
