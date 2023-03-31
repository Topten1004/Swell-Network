import { alpha, Components, Theme } from '@mui/material';

// ----------------------------------------------------------------------

const Backdrop = (theme: Theme): Components => ({
  MuiBackdrop: {
    styleOverrides: {
      root: {
        background: alpha(theme.palette.common.black, 0.2),
        '&.MuiBackdrop-invisible': {
          background: 'transparent',
        },
      },
    },
  },
});

export default Backdrop;
