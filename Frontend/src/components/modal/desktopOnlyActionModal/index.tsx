/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC } from 'react';
import { useNavigate } from 'react-router';

import { Box } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setIsDesktopOnlyModalOpen } from '../../../state/modal/modalSlice';
import { Modal } from '../../../theme/uiComponents';

const DesktopOnlyActionModal: FC = () => {
  const { isDesktopOnlyModalOpen } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleClose = () => {
    dispatch(setIsDesktopOnlyModalOpen(false));
    navigate('/');
  };
  return (
    <Modal
      maxWidth="sm"
      onClose={handleClose}
      open={isDesktopOnlyModalOpen}
      sx={{
        '& .MuiDialogTitle-root,  & .MuiDialogContent-root': {
          paddingInline: {
            sm: '38px',
          },
        },
        '& .MuiDialogTitle-root button': {
          right: { sm: '20px' },
        },
      }}
      title="Desktop only"
    >
      <Box
        sx={{
          borderRadius: '15px',
          fontWeight: 500,
          fontSize: 16.9,
          '& a': {
            color: 'inherit',
            fontWeight: 600,
            textDecoration: 'underline',
          },
        }}
      >
        Please switch to desktop for signing as a node operator.
      </Box>
    </Modal>
  );
};

export default DesktopOnlyActionModal;
