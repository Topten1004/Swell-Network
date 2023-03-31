import { FC } from 'react';

import { Close } from '@mui/icons-material';
import { Dialog, DialogContent, DialogProps, DialogTitle, IconButton, styled } from '@mui/material';

const ModalDialog = styled(Dialog)(({ theme }) => ({
  '.MuiDialog-container > .MuiPaper-root': {
    borderRadius: '31px',
    '&.MuiDialog-paperWidthSm': {
      maxWidth: '600px',
    },
    [theme.breakpoints.down('sm')]: {
      borderRadius: '20px',
      margin: '10px',
    },
    width: '100%',
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

interface ModalDialogProps extends DialogProps {
  icon?: React.ReactNode;
}

// eslint-disable-next-line import/prefer-default-export
export const Modal: FC<ModalDialogProps> = ({ open, onClose, title, children, icon, ...props }) => (
  // eslint-disable-next-line react/jsx-max-props-per-line
  <ModalDialog maxWidth="xs" onClose={onClose} open={open} {...props}>
    <DialogTitle
      sx={{
        m: 0,
        padding: ['16px 15px', '20px 38px'],
        fontSize: [16, 22],
        fontWeight: 600,
        '& .icon': {
          mx: '10px',
        },
        '& > button + span': {
          marginLeft: '10px',
        },
      }}
    >
      {icon && (
        <IconButton
          sx={{
            padding: 0,
            color: (theme) => theme.palette.common.black,
            '& svg': {
              fontSize: '30px',
            },
          }}
        >
          {icon}
        </IconButton>
      )}
      <span>{title}</span>
      {onClose ? (
        <IconButton
          className="close-btn"
          onClick={(e) => onClose(e, 'backdropClick')}
          sx={{
            position: 'absolute',
            right: [3, 23],
            top: [5, 14],
            color: (theme) => theme.palette.common.black,
          }}
        >
          <Close sx={{ width: 30, height: 30 }} />
        </IconButton>
      ) : null}
    </DialogTitle>
    <DialogContent
      sx={{
        padding: ['0px 15px 20px', '0px 28px 20px'],
        'div + &': {
          paddingTop: ['15px !important', '25px !important'],
        },
      }}
    >
      {children}
    </DialogContent>
  </ModalDialog>
);
