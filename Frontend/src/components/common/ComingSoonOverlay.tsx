import React from 'react';

import { Box } from '@mui/material';

const ComingSoonOverlay: React.FC = () => (
  <>
    <Box
      sx={{
        backdropFilter: 'blur(8px)',
        height: '100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        position: 'absolute',
        zIndex: 2,
      }}
    />
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.common.white,
        color: (theme) => theme.palette.common.black,
        fontSize: '44px',
        fontWeight: 'bold',
        border: '3px solid #f1f1f1',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        padding: '20px',
        textAlign: 'center',
      }}
    >
      Coming Soon
    </Box>
  </>
);

export default ComingSoonOverlay;
