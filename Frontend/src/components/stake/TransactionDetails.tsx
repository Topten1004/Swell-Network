import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { Box, styled } from '@mui/material';

import { ListColumn, SwellIcon } from '../../theme/uiComponents';

const Row = styled(ListColumn)({
  paddingInline: '11px',
});

interface IProps {
  watchField: string;
}

const TransactionDetails: FC<IProps> = ({ watchField }) => {
  const { watch } = useFormContext();
  const enteredAmount = watch(watchField);

  return (
    <Box sx={{ marginTop: '20px' }}>
      <Row>
        You will receive
        <span>
          <SwellIcon size="xs" /> {enteredAmount ?? 0} swETH
        </span>
      </Row>
      <Row>
        Exchange rate
        <span>1 ETH = 1 swETH</span>
      </Row>
    </Box>
  );
};
export default TransactionDetails;
