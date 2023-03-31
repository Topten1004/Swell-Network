// ----------------------------------------------------------------------

import { Components, darken, Theme } from '@mui/material';

const Input = (theme: Theme): Components => ({
  MuiTextField: {
    defaultProps: {
      fullWidth: true,
    },
    styleOverrides: {
      root: {
        marginBottom: '15px',
      },
    },
  },
  MuiFormControl: {
    styleOverrides: {
      root: {
        marginBottom: '15px',
        '& .MuiInputBase-root': {
          marginBottom: 0,
        },
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        '&.Mui-disabled': {
          '& svg': { color: theme.palette.text.disabled },
        },
      },
      input: {
        '&::placeholder': {
          opacity: 1,
          color: theme.palette.text.disabled,
        },
      },
    },
  },
  MuiInput: {
    defaultProps: {
      disableUnderline: true,
    },
    styleOverrides: {
      underline: {
        // '&:before': {
        //   borderBottomColor: theme.palette.grey[500_56]
        // }
      },
    },
  },
  MuiFilledInput: {
    styleOverrides: {
      root: {
        // backgroundColor: theme.palette.grey[500_12],
        '&:hover': {
          // backgroundColor: theme.palette.grey[500_16]
        },
        '&.Mui-focused': {
          backgroundColor: theme.palette.action.focus,
        },
        '&.Mui-disabled': {
          backgroundColor: theme.palette.action.disabledBackground,
        },
      },
      underline: {
        '&:before': {
          // borderBottomColor: theme.palette.grey[500_56]
        },
      },
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      input: {
        '&::placeholder': {
          color: theme.palette.common.black,
        },
      },
    },
  },
  MuiInputLabel: {
    defaultProps: {
      shrink: true,
    },
    styleOverrides: {
      root: {
        transform: 'none',
        position: 'initial',
        fontSize: theme.typography.htmlFontSize,
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        marginLeft: 0,
        marginRight: 0,
      },
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        background: theme.palette.common.white,
        fontSize: theme.typography.htmlFontSize,
        fontWeight: theme.typography.fontWeightMedium,
        '& legend': {
          display: 'none',
        },
        '&:note(.Mui-error):hover .MuiOutlinedInput-notchedOutline': {
          borderColor: darken(theme.palette.grey.A200, 0.3),
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.grey.A200,
          top: 0,
        },
        '&.Mui-disabled': {
          background: theme.palette.mode === 'light' ? theme.palette.grey.A400 : theme.palette.grey['200'],
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.action.disabledBackground,
          },
        },
      },
    },
  },
});

export default Input;
