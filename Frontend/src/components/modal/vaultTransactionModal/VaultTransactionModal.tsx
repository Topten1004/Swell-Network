/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC } from 'react';

import { Box } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setIsVaultTransactionModalOpen } from '../../../state/modal/modalSlice';
import { Modal, SwellIcon } from '../../../theme/uiComponents';
import VaultTransactionTabPanelModal from '../../vaultTransaction/VaultTransactionTabPanelModal';

const VaultTransactionModal: FC = () => {
  const { isVaultTransactionModalOpen } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  return (
    <Modal
      icon={<SwellIcon size="sm" />}
      maxWidth="sm"
      onClose={() => dispatch(setIsVaultTransactionModalOpen(false))}
      open={isVaultTransactionModalOpen}
      sx={{
        '& .MuiDialog-paper': {
          maxWidth: '526px !important',
        },
        '& .MuiTypography-root': {
          paddingBottom: '30px',
        },
      }}
      title="Enter or exit vault"
    >
      <Box
        sx={{
          '& > .MuiBox-root': {
            padding: 0,
          },
          '& .tabs-content': {
            border: (theme) => `1px solid ${theme.palette.grey[300]} !important`,
            borderRadius: '8px',
            marginTop: '30px',
          },
          '& .MuiPaper-root': {
            maxWidth: {
              xs: '100%',
              sm: '357px',
            },
            margin: 'auto',
            paddingInline: '20px',
          },
        }}
      >
        <VaultTransactionTabPanelModal />
      </Box>
    </Modal>
  );
};

export default VaultTransactionModal;
