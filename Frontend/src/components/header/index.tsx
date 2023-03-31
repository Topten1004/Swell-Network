import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, styled, useMediaQuery, useTheme } from '@mui/material';
import { useWeb3React } from 'web3-react-core';

import { SwellIcon, SwellLogo } from '../../theme/uiComponents';
import { SelectNetwork } from '../selectNetwork';
import { AppMenu } from './AppMenu';
import MoreMenu from './Menu';
import { SideWalletWidget } from './SideWalletWidget';

const AppHeader = styled('div')({
  display: 'grid',
  gridTemplateColumns: '120px 1fr 120px',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const Header: FC = () => {
  const theme = useTheme();
  const matches = useMediaQuery(`(max-width:${theme.breakpoints.values.sm}px)`);
  const smDesktop = useMediaQuery('(max-width: 1200px)');
  const navigate = useNavigate();
  const { account } = useWeb3React();
  return (
    <AppHeader
      sx={{
        p: ['10px', '24px 20px', '24px 30px'],
        gridTemplateColumns: ['auto auto', '120px 1fr 120px'],
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <span onClick={() => navigate('/')} role="button" tabIndex={0}>
        {matches ? <SwellIcon size="md" /> : <SwellLogo sx={{ width: 104, height: 'auto' }} />}
      </span>
      <AppMenu />
      <Box
        sx={{
          display: 'flex',
          whiteSpace: 'nowrap',
          justifySelf: 'flex-end',
          alignItems: account ? '' : 'center',
          height: '36px',
          gap: smDesktop ? '6px' : '10px',
          flexDirection: account && smDesktop ? 'row-reverse' : '',
        }}
      >
        <MoreMenu />
        <SelectNetwork showNetworkSelectionDropDown />
        {account && <SideWalletWidget />}
      </Box>
    </AppHeader>
  );
};

export default Header;
