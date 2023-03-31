/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-props-no-spreading */
import { FC, useRef } from 'react';

import { Close } from '@mui/icons-material';
import { styled } from '@mui/material';
import { SnackbarProvider, SnackbarProviderProps } from 'notistack';

const MuiSnackbarProvider = styled(SnackbarProvider)(({ theme }) => ({
  '&.SnackbarContent-root': {
    boxShadow: '0 0 10px 0 rgba(180,180,180,0.5)',
    borderRadius: 8,
    background: theme.palette.common.white,
    color: 'inherit',
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'inherit',
    maxWidth: 300,
    wordBreak: 'break-word',
    '@media only screen and (max-width:1200px)': {
      margin: 'auto',
    },
    '& svg': {
      marginRight: '10px',
    },
    '&.SnackbarItem-variantError': {
      color: theme.palette.error.main,
      '& svg': {
        width: '15px',
        height: '15px',
        background: theme.palette.error.light,
        borderRadius: '50%',
        '& > path': {
          stroke: theme.palette.error.main,
        },
      },
    },
    '&.SnackbarItem-variantSuccess': {
      color: theme.palette.success.main,
      '& svg': {
        '& > circle': {
          fill: theme.palette.success.light,
        },
        '& > path': {
          stroke: theme.palette.success.main,
        },
      },
    },
    '&.SnackbarItem-variantWarning': {
      color: theme.palette.warning.main,
    },
    '&.SnackbarItem-variantInfo': {
      color: theme.palette.info.main,
    },
  },
}));
export const Snackbar: FC<SnackbarProviderProps> = ({ ...props }) => {
  const notistackRef = useRef<any>();
  return (
    <MuiSnackbarProvider
      // hideIconVariant
      {...props}
      // action={(key) => (
      //   <IconButton onClick={() => notistackRef?.current.closeSnackbar(key)} size="small">
      //     Close
      //   </IconButton>
      // )}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      iconVariant={{
        error: <Close />,
        success: <SuccessIcon />,
        warning: <WarningIcon />,
      }}
      preventDuplicate
      ref={notistackRef}
    />
  );
};

// eslint-disable-next-line @typescript-eslint/ban-types
type HTMLProps = {};

export const SuccessIcon = styled(({ ...HTMLProps }: HTMLProps) => (
  <svg {...HTMLProps} fill="none" height="16" viewBox="0 0 16 16" width="16">
    <circle cx="8" cy="8" fill="url(#paint0_linear)" r="8" />
    <path d="M11.4095 4.59016L6.51755 11.4092L4.59042 9.48211" stroke="#192243" />
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id="paint0_linear"
        x1="0.633095"
        x2="18.8927"
        y1="-1.80001"
        y2="0.60095"
      >
        <stop stopColor="#66F6A0" />
        <stop offset="1" stopColor="#90F4E2" />
      </linearGradient>
    </defs>
  </svg>
))({});

export const WarningIcon = styled(({ ...HTMLProps }) => (
  <svg {...HTMLProps} fill="none" height="16" viewBox="0 0 16 16" width="16">
    <path
      clipRule="evenodd"
      d="M2.34375 13.6563C3.85603 15.1687 5.86272 16 8 16C10.1373 16 12.1473 15.1687 13.6563 13.6563C15.1685 12.1438 16 10.1375 16 8C16 5.86251 15.1685 3.8531 13.6563 2.34375C12.1473 0.831264 10.1373 0 8 0C5.86272 0 3.85268 0.831264 2.34375 2.34375C0.831473 3.8531 0 5.86251 0 8C0 10.1375 0.831473 12.1469 2.34375 13.6563ZM7 4C7 3.44685 7.44643 3 8 3C8.55357 3 9 3.44685 9 4V9C9 9.55315 8.55357 10 8 10C7.44643 10 7 9.55315 7 9V4ZM9 12C9 11.4468 8.55357 11 8 11C7.44643 11 7 11.4468 7 12C7 12.5532 7.44643 13 8 13C8.55357 13 9 12.5532 9 12Z"
      fill="#F14F4F"
      fillRule="evenodd"
    />
  </svg>
))({});
