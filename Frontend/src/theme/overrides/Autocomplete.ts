// ----------------------------------------------------------------------

import { Components, Theme } from '@mui/material';

const Autocomplete = (theme: Theme): Components => ({
  MuiAutocomplete: {
    styleOverrides: {
      paper: {
        boxShadow: theme.shadows['10'],
      },
    },
  },
});

export default Autocomplete;
