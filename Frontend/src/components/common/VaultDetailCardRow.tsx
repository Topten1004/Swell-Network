import React from 'react';

import { Box, Typography } from '@mui/material';

interface IVaultDetailCard {
  name: string;
  value: string | React.ReactNode;
}

const VaultDetailCardRow: React.FC<IVaultDetailCard> = ({ name, value }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      '& > span': {
        lineHeight: '2rem',
      },
    }}
  >
    <Typography component="span">{name}</Typography>
    <Typography component="span">{value}</Typography>
  </Box>
);
export default VaultDetailCardRow;
