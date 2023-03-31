import { Box, Button, CircularProgress, styled, useTheme } from '@mui/material';
import { UnsupportedChainIdError, useWeb3React } from 'web3-react-core';

import PiggyBankIcon from '../../assets/images/piggy-bank.svg';
import { useAppDispatch } from '../../state/hooks';
import { setIsWalletModalOpen } from '../../state/modal/modalSlice';

const NoWallet = styled('div')(({ theme }) => ({
  background: theme.palette.common.white,
  borderRadius: '8px',
  padding: '40px 20px',
  textAlign: 'center',
  alignItems: 'center',
  display: 'flex',
  marginBottom: '20px',
  justifyContent: 'center',
  [theme.breakpoints.up('md')]: {
    minHeight: 380,
  },
  [theme.breakpoints.up('sm')]: {
    padding: '50px 0',
  },
  fontSize: 18,
  fontWeight: theme.typography.fontWeightRegular,
  '& p': {
    margin: '20px 0',
  },
}));

interface INoWalletConnectedProps {
  loading?: boolean;
  heading: React.ReactNode;
  text: string;
}

// eslint-disable-next-line import/prefer-default-export
export const NoWalletConnected: React.FC<INoWalletConnectedProps> = ({ loading, heading, text }) => {
  const { account, error } = useWeb3React();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const showConnectWallet = Boolean(!account);
  return (
    <>
      {heading}
      <NoWallet>
        <Box sx={{ maxWidth: 296 }}>
          <img alt="piggy bank" src={PiggyBankIcon} />
          <p>{text}</p>
          {/* eslint-disable-next-line no-nested-ternary */}
          {showConnectWallet && (
            <>
              {error && (
                <Button color="error" onClick={() => dispatch(setIsWalletModalOpen(true))}>
                  {error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}
                </Button>
              )}
              {!loading && !error && (
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
          )}
          {loading && <CircularProgress />}
        </Box>
      </NoWallet>
    </>
  );
};
