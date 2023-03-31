import React from 'react';

import { Verified as VerifiedIcon } from '@mui/icons-material';
import { Chip, useTheme } from '@mui/material';

const VerifiedUser: React.FC = () => {
  const theme = useTheme();
  return (
    <Chip
      icon={<VerifiedIcon />}
      label="Verified"
      size="medium"
      sx={{
        padding: '6px 10px',
        border: 'none',
        backgroundColor: theme.palette.primary.light,
        height: 20,
        width: 'fit-content',
        '& > svg.MuiChip-avatar': {
          fill: theme.palette.primary.main,
          backgroundColor: 'unset',
        },
        '& > span': { padding: '0 0 0 5px' },
      }}
      variant="outlined"
    />
  );
};

export default VerifiedUser;
