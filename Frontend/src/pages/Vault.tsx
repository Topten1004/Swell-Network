import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Typography } from '@mui/material';
import { useWeb3React } from 'web3-react-core';

// import ComingSoonOverlay from '../components/common/ComingSoonOverlay';

import { NoWalletConnected } from '../components/common/NoWalletConnected';
import VaultLists from '../components/vault/VaultLists';
import { useVaults } from '../hooks/useVault';

const Vault: FC = () => {
  const { account, chainId } = useWeb3React();
  const { vaults, loading, totalVaults } = useVaults();
  const navigate = useNavigate();

  useEffect(() => {
    if (chainId && chainId === 1) {
      navigate('/');
    }
  }, [chainId, navigate]);

  return (
    <>
      {vaults && vaults.length > 0 ? (
        <>
          <Box
            sx={{
              border: (theme: { palette: { common: { white: any } } }) => `2px solid ${theme.palette.common.white}`,
              borderRadius: '8px',
              padding: '20px 20px 16px 20px',
              marginBottom: '54px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* <ComingSoonOverlay /> */}
            <Typography
              sx={{
                fontSize: 22,
                display: 'flex',
                justifyContent: 'space-between',
                paddingInline: '20px',
              }}
              variant="h3"
            >
              Vaults
            </Typography>
            <VaultLists loading={loading} totalVaults={totalVaults} vaults={vaults} />
          </Box>
        </>
      ) : (
        <NoWalletConnected
          heading={
            <Typography
              sx={{
                fontSize: 22,
                display: 'flex',
                marginBottom: account ? '20px' : '',
                justifyContent: 'space-between',
                paddingInline: '20px',
              }}
              variant="h3"
            >
              Vaults
            </Typography>
          }
          loading={loading}
          text="No vault available."
        />
      )}
    </>
  );
};

export default Vault;
