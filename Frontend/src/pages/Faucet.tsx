import React from 'react';
import { Navigate } from 'react-router';

import { InfoOutlined } from '@mui/icons-material';
import { Card, Tooltip, Typography } from '@mui/material';

import FaucetCard from '../components/Faucet/FaucetCard';
import { SupportedChainId } from '../constants/chains';
import useActiveWeb3React from '../hooks/useActiveWeb3React';

interface IProps {
  network: string;
}

const Faucet: React.FC<IProps> = ({ network }) => {
  const { chainId } = useActiveWeb3React();

  if (network === 'Kaleido' && chainId && chainId !== SupportedChainId.KALEIDO) {
    return <Navigate replace to="/" />;
  }

  if (network === 'Goerli' && chainId && chainId !== SupportedChainId.GOERLI) {
    return <Navigate replace to="/" />;
  }

  return (
    <>
      <Typography
        component="h2"
        sx={{
          marginBottom: '40px',
          textAlign: 'center',
        }}
        variant="h2"
      >
        {`${network} Faucet`}
        <Tooltip title="Faucet can only be used a maximum of 3 times per user.">
          <InfoOutlined sx={{ fontSize: '20px', marginLeft: '15px' }} />
        </Tooltip>
      </Typography>
      <Card
        sx={{
          padding: ['20px', '60px 25px'],
        }}
      >
        <FaucetCard sx={{ maxWidth: '550px', marginInline: 'auto' }} />
      </Card>
    </>
  );
};

export default Faucet;
