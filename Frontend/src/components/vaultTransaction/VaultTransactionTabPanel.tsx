import Tabs from '../../theme/uiComponents/TabPanel';
import { VaultTransactionType } from '../common/ChoosePosition';
import VaultTransaction from './VaultTransactionForm';

const VaultTransactionTabPanel: React.FC = () => (
  <Tabs
    tabs={[
      {
        label: VaultTransactionType.ENTER,
        component: (
          <>
            <VaultTransaction type={VaultTransactionType.ENTER} />
          </>
        ),
      },
      {
        label: VaultTransactionType.EXIT,
        component: (
          <>
            <VaultTransaction type={VaultTransactionType.EXIT} />
          </>
        ),
      },
    ]}
  />
);

export default VaultTransactionTabPanel;
