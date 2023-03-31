// ----------------------------------------------------------------------
import { Components, Theme } from '@mui/material';

const Card = (theme: Theme): Components => ({
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        // borderRadius: theme.shape.borderRadiusMd,
        position: 'relative',
        zIndex: 0,
        background: theme.palette.background.transparendBg,
        border: `2px solid ${theme.palette.common.white}`,
      },
    },
  },
  MuiCardHeader: {
    defaultProps: {
      titleTypographyProps: { variant: 'h3' },
      subheaderTypographyProps: { variant: 'body2' },
    },
    styleOverrides: {
      root: {
        padding: '14px 20px',
        [theme.breakpoints.down('sm')]: {
          padding: '14px 15px',
        },
        borderBottom: `2px solid ${theme.palette.common.white}`,
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '14px 20px',
        [theme.breakpoints.down('sm')]: {
          padding: '14px 15px',
        },
      },
    },
  },
});

export default Card;
