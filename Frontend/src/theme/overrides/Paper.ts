// ----------------------------------------------------------------------

import { Components } from '@mui/material';

const Paper = (): Components => ({
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },

    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
});

export default Paper;
