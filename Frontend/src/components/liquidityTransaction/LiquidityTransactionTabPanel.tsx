import { FC } from 'react';

import Tabs from '../../theme/uiComponents/TabPanel';
import { DepositLiquidityTransaction } from './DepositLiquidityTransaction';
import { WithdrawLiquidityTransaction } from './WithdrawLiquidityTransaction';

const LiquidityTransactionTabPanel: FC = () => (
  <Tabs
    tabs={[
      {
        label: 'Deposit',
        component: <DepositLiquidityTransaction />,
      },
      {
        label: 'Withdraw',
        component: <WithdrawLiquidityTransaction />,
      },
    ]}
  />
);

export default LiquidityTransactionTabPanel;
