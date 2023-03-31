import { Copy } from 'react-feather';

import { styled } from '@mui/material';

import useCopyClipboard from '../../hooks/useCopyClipboard';
import { shortenAddress } from '../../utils';

const StyledAddress = styled('h3')(() => ({
  alignItems: 'center',
  fontSize: '22px',
  marginBottom: 0,
  cursor: 'pointer',
  minWidth: '200px',
  minHeight: '26px',
  display: 'flex',
  alignSelf: 'center',

  span: {
    display: 'none',
    '&:first-child': {
      display: 'inline',
    },
  },

  '&:hover': {
    span: {
      display: 'inline',
      '&:first-child': {
        display: 'none',
      },
    },
  },
}));

const CopyText = styled('span')(() => ({
  fontWeight: 400,
  lineHeight: 28 / 18,
  fontSize: 14,
  marginLeft: '8px',
  '& svg': {
    marginRight: '5px',
  },
}));

interface VaultAddressType {
  name?: string;
  address?: string;
}

const VaultAddress: React.FC<VaultAddressType> = ({ name, address }) => {
  const [isCopied, setCopied] = useCopyClipboard();

  return (
    <StyledAddress onClick={() => address && setCopied(address)} role="button">
      <span>{name}</span>
      <span>{address ? shortenAddress(address) : ''}</span>
      {isCopied && (
        <CopyText>
          <Copy size="16" />
          Copied
        </CopyText>
      )}
    </StyledAddress>
  );
};

export default VaultAddress;
