// ----------------------------------------------------------------------

import { Components, Theme } from '@mui/material';

const Typography = (theme: Theme): Components => ({
  MuiTypography: {
    defaultProps: {
      gutterBottom: true,
    },
    styleOverrides: {
      paragraph: {
        marginBottom: theme.spacing(2),
      },
      gutterBottom: {
        marginBottom: theme.spacing(1),
      },
    },
  },
});

export default Typography;
