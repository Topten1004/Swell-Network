import { FC } from 'react';

import { ExpandMore } from '@mui/icons-material';
import { Box, BoxProps, styled } from '@mui/material';
import { useWeb3React } from 'web3-react-core';

import { shortenAddress } from '../../utils';
import { WrappedStatusIcon } from '../AccountDetails';

type Props = BoxProps & {
  onClickDropDown?: React.MouseEventHandler<SVGSVGElement | HTMLButtonElement>;
  variant?: 'default' | 'outlined';
  char?: number;
  isPointer?: boolean;
};
const Address = styled('span')(({ theme }) => ({
  display: 'block',
  whiteSpace: 'nowrap',
  fontSize: theme.typography.fontSize,
  textOverflow: 'ellipsis',
  paddingRight: 20,
  overflow: 'hidden',
  fontWeight: 500,
  padding: '4px 15px',
  textAlign: 'center',
}));
const Web3Status: FC<Props> = ({ sx, char, isPointer, variant = 'default', onClick, onClickDropDown, ...props }) => {
  const { account, connector } = useWeb3React();
  return (
    <Box
      {...props}
      sx={{
        display: 'flex',
        background: (theme) => theme.palette.common.white,
        alignItems: 'center',
        borderRadius: '16px',
        border: '2px solid #fff',
        justifyContent: 'center',
        maxWidth: 'max-content',
        borderColor: (theme) => (variant === 'outlined' ? theme.palette.grey[300] : theme.palette.grey.A400),
        ...sx,
      }}
    >
      {connector && <WrappedStatusIcon connector={connector} displayShowPortisButton={false} />}
      <Address
        onClick={onClick}
        sx={{ cursor: isPointer === false ? 'default' : 'pointer', paddingLeft: connector ? 0 : '' }}
      >
        {account ? shortenAddress(account, char || 13) : 'Wallet not connected'}
      </Address>
      {onClickDropDown && (
        <ExpandMore
          onClick={onClickDropDown}
          role="button"
          sx={{
            background: (theme) => theme.palette.primary.light,
            color: (theme) => theme.palette.primary.main,
            width: 20,
            height: 20,
            borderRadius: '50%',
            marginRight: '10px',
          }}
        />
      )}
    </Box>
  );
};

export default Web3Status;
