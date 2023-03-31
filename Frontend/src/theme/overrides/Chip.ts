import { Components, Theme } from '@mui/material';

const Chip = (theme: Theme): Components => ({
  MuiChip: {
    defaultProps: {
      color: 'primary',
      size: 'small',
    },
    styleOverrides: {
      root: {
        fontWeight: theme.typography.fontWeightBold,
        padding: '1px 10px',
        '& .MuiChip-icon': {
          width: '15px',
          height: 'auto',
          marginRight: 2,
          marginLeft: -3,
        },
      },
      avatar: {
        width: 28,
        height: 28,
        marginLeft: -7,
      },
      sizeSmall: {
        fontSize: '12px',
        padding: '1px 10px',
        height: 19,
        '& .MuiChip-label': {
          padding: 0,
        },
      },
      sizeMedium: {
        fontSize: '13px',
        fontWeight: theme.typography.fontWeightMedium,
      },
      filled: {
        '&.MuiChip-colorPrimary': {
          background: theme.palette.primary.light,
          color: theme.palette.primary.main,
        },
        '&.MuiChip-colorDefault': {
          background: theme.palette.common.white,
        },
      },
      colorPrimary: {
        avatar: {},
      },
    },
  },
});

export default Chip;
