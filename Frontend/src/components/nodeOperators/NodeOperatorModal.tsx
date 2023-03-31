import { FC } from 'react';

import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { setIsNodeOperatorModalOpen } from '../../state/modal/modalSlice';
import { Modal } from '../../theme/uiComponents';
import NodeOperatorCard from './NodeOperatorCard';

const NodeOperatorModal: FC = () => {
  const { isNodeOperatorModalOpen } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  return (
    <Modal
      maxWidth="sm"
      onClose={() => dispatch(setIsNodeOperatorModalOpen(false))}
      open={isNodeOperatorModalOpen}
      sx={{
        '& .MuiDialogTitle-root': {
          paddingInline: '30px',
          '& .close-btn': {
            right: '15px',
          },
        },
        '& .MuiDialogContent-root': {
          paddingInline: '25px',
        },
      }}
      title="Select Node Operator"
    >
      <NodeOperatorCard />
    </Modal>
  );
};
export default NodeOperatorModal;
