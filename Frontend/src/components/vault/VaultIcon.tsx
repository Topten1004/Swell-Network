import { styled } from '@mui/material';

import { SwellIcon } from '../../theme/uiComponents';

const StyledVaultIcon = styled('img')(() => ({
  width: '24px',
  height: '24px',
}));

interface VaultIconType {
  logo?: string;
}

const VaultIcon: React.FC<VaultIconType> = ({ logo }) =>
  logo ? <StyledVaultIcon alt="" src={logo} /> : <SwellIcon size="sm" />;

export default VaultIcon;
