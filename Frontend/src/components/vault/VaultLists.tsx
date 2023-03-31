import { FC } from 'react';

import { LoadingButton } from '@mui/lab';

import VaultTransactionModal from '../modal/vaultTransactionModal/VaultTransactionModal';
import VaultListItem from './VaultListItem';

interface IVaultListProps {
  loading: boolean;
  vaults: any[];
  totalVaults: number;
}

const VaultLists: FC<IVaultListProps> = ({ loading, vaults, totalVaults }) => (
  <>
    {!loading && vaults && vaults.length > 0 && (
      <>
        {vaults.map((_vault, index) => {
          const key = `vault-item-${index}`;
          return <VaultListItem index={index} key={key} />;
        })}
        {totalVaults > 4 && (
          <LoadingButton size="small" sx={{ fontWeight: 500, marginTop: '20px' }} variant="text">
            Load more
          </LoadingButton>
        )}
      </>
    )}

    <VaultTransactionModal />
  </>
);

export default VaultLists;
