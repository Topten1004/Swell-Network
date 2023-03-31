import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useWeb3React } from 'web3-react-core';

import ConnectWalletModal from '../components/modal/walletConnectModal/ConnectWalletModal';
import { SelectNetwork } from '../components/selectNetwork';
import { usePOAPBalance } from '../hooks/usePOAPBalance';
import Router from '../routes';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { setIsNodeOperatorModalOpen } from '../state/modal/modalSlice';
import { SwellLogo } from '../theme/uiComponents';

const BYPASS_POAP = process.env.REACT_APP_BYPASS_POAP ?? '';

const POAPDashboard: FC = () => {
  const { account } = useWeb3React();
  const { balance, loading } = usePOAPBalance(account);
  const dispatch = useAppDispatch();
  const { isWalletModalOpen } = useAppSelector((state) => state.modal);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (balance) {
      setIsAuthenticated(true);
      dispatch(setIsNodeOperatorModalOpen(false));
    } else {
      setIsAuthenticated(false);
    }
  }, [balance, dispatch, navigate]);

  return isAuthenticated || BYPASS_POAP === 'true' ? (
    <Router />
  ) : (
    <Box
      sx={{
        display: 'flex',
        textAlign: 'center',
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          margin: 'auto',
          textAlign: 'center',
          bgcolor: 'white',
          borderRadius: 1,
          py: 7,
          px: 7,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ mx: 'auto', mb: { xs: 2, sm: 4 }, mt: { xs: 0, sm: 1 } }}>
          <SwellLogo sx={{ height: 62, width: 160 }} />
        </Box>
        {/* eslint-disable-next-line no-nested-ternary */}
        {account ? (
          loading ? (
            <CircularProgress sx={{ margin: '50px auto' }} />
          ) : (
            <>
              <Typography color="error" paragraph variant="h3">
                No Authorization
              </Typography>
              <Typography>
                Sorry, you don&apos;t have a valid POAP to access the Swell Network platform. Please contact support.
              </Typography>
            </>
          )
        ) : (
          <>
            <Typography paragraph variant="h3">
              Welcome
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>Welcome to Swell Network staking platform</Typography>
          </>
        )}
        <SelectNetwork buttonStyle={{ marginTop: '20px' }} showSwitchNetwork={!!account && !loading} />
      </Box>
      {isWalletModalOpen && <ConnectWalletModal />}
    </Box>
  );
};

export default POAPDashboard;
