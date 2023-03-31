import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Typography, useTheme } from '@mui/material';
import { useWeb3React } from 'web3-react-core';

import { NoWalletConnected } from '../components/common/NoWalletConnected';
import PositionsList from '../components/positionList';
import { useV3Positions } from '../hooks/useV3Positions';

const Dashboard: FC = () => {
  const { account } = useWeb3React();
  const navigate = useNavigate();
  const theme = useTheme();
  const { positions, loading } = useV3Positions(account);
  const [resultLength, setResultLength] = useState<number>(5);

  const handleLoadMore = () => {
    if (resultLength) {
      setResultLength(resultLength + 5);
    }
  };

  return (
    <>
      {positions && positions.length > 0 ? (
        <>
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
            {account ? 'Your Positions' : 'Your Staked ETH Positions'}
            {account && (
              <Button onClick={() => navigate('/stake')} size="medium" sx={{ color: theme.palette.grey.A400 }}>
                + New Position
              </Button>
            )}
          </Typography>
          <PositionsList positions={positions.slice(0, resultLength)} />
          {positions.length > 5 && resultLength < positions.length && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                onClick={handleLoadMore}
                size="small"
                sx={{ fontWeight: 500, marginBottom: '20px' }}
                variant="text"
              >
                Load More
              </Button>
            </Box>
          )}
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
              {account ? 'Your Positions' : 'Your Staked ETH Positions'}
              {account && (
                <Button onClick={() => navigate('/stake')} size="medium" sx={{ color: theme.palette.grey.A400 }}>
                  + New Position
                </Button>
              )}
            </Typography>
          }
          loading={loading}
          text="Your active staked ETH positions will appear here."
        />
      )}
    </>
  );
};

export default Dashboard;
