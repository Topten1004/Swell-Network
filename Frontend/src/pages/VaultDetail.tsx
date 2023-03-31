import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArrowBack, TransitEnterexit } from '@mui/icons-material';
import { alpha, Box, Card, CardContent, CardHeader, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useWeb3React } from 'web3-react-core';

import VaultDetailCard from '../components/common/VaultDetailCard';
import VaultDetailCardRow from '../components/common/VaultDetailCardRow';
import VaultAddress from '../components/vault/VaultAddress';
import VaultIcon from '../components/vault/VaultIcon';
import VaultTransactionTabPanel from '../components/vaultTransaction/VaultTransactionTabPanel';
import { useVaultDetail } from '../hooks/useVault';
import { SwellIcon } from '../theme/uiComponents';

const VaultDetail: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { index } = useParams<{ index: string }>();
  const { account } = useWeb3React();
  const matches = useMediaQuery(`(max-width:${theme.breakpoints.values.sm}px)`);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { loading, vaultDetail } = useVaultDetail((Number(index) - 1)!, account);
  useEffect(() => {
    if (!account) {
      navigate('/');
    }
  }, [account, navigate]);
  if (loading) {
    return <></>;
  }
  return (
    <>
      <Typography
        component="span"
        onClick={() => navigate('/vaults')}
        role="button"
        sx={{ alignItems: 'center', marginBottom: '10px', display: 'block' }}
      >
        <ArrowBack />
        Back to all vaults
      </Typography>
      <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '20px' }}>
        <VaultIcon logo={vaultDetail?.info?.logo} />
        <VaultAddress address={vaultDetail?.address} name={vaultDetail?.info?.name} />
      </Box>
      <Box sx={{ display: 'flex', gap: '20px' }}>
        <Box sx={{ maxWidth: ['100%', '42%'] }}>
          <Card
            sx={{
              color: theme.palette.grey.A400,
              background: theme.palette.background.blueGradient,
              border: 0,
              mb: '20px',
            }}
          >
            <CardHeader
              sx={{
                '& .MuiTypography-root': { m: 0, fontSize: '16px' },
                border: `1px solid ${alpha(theme.palette.grey.A400, 0.3)}`,
              }}
              title="Vault overview"
            />
            <CardContent>
              <VaultDetailCardRow name="APR" value={`${vaultDetail?.averageAPR}%`} />
              <VaultDetailCardRow
                name="Total assets"
                value={
                  <>
                    <SwellIcon color="default" sx={{ marginRight: '5px' }} />
                    {vaultDetail?.balance}
                  </>
                }
              />
              <VaultDetailCardRow name="Vault type" value={vaultDetail?.info?.type || ''} />
              <VaultDetailCardRow
                name="Website"
                value={
                  vaultDetail?.info?.website && (
                    <a
                      href={`https://${vaultDetail.info.website}`}
                      rel="noreferrer"
                      style={{ color: 'white' }}
                      target="_blank"
                    >
                      {vaultDetail.info.website}
                      <TransitEnterexit
                        sx={{
                          transform: 'rotate(180deg)',
                          fontSize: '16px',
                        }}
                      />
                    </a>
                  )
                }
              />
            </CardContent>
          </Card>
          {matches && <VaultTransactionTabPanel />}
          {vaultDetail?.info && (
            <VaultDetailCard
              content={vaultDetail.info.content}
              contentMore={vaultDetail.info.contentMore}
              title="Vault strategy"
            />
          )}
        </Box>
        {!matches && <VaultTransactionTabPanel />}
      </Box>
    </>
  );
};

export default VaultDetail;
