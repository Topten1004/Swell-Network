import Tabs from '../../theme/uiComponents/TabPanel';
import { VaultTransactionType } from '../common/ChoosePosition';
import VaultTransactionModal from './VaultTransactionModal';

const VaultTransactionTabPanelModal: React.FC = () => (
  <Tabs
    tabs={[
      {
        label: VaultTransactionType.ENTER,
        component: (
          <>
            <VaultTransactionModal type={VaultTransactionType.ENTER} />
          </>
        ),
      },
      {
        label: VaultTransactionType.EXIT,
        component: (
          <>
            <VaultTransactionModal type={VaultTransactionType.EXIT} />
          </>
        ),
      },
    ]}
  />
);

export default VaultTransactionTabPanelModal;
