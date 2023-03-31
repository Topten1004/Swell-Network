import { FC } from 'react';
import { NavLink } from 'react-router-dom';

import { Box, styled } from '@mui/material';

import useActiveWeb3React from '../../hooks/useActiveWeb3React';

const HeaderMenu = styled('menu')(({ theme }) => ({
  border: `1px solid ${theme.palette.common.white}`,
  borderRadius: 18,
  padding: '3px',
  display: 'flex',
  fontWeight: theme.typography.fontWeightBold,
  textAlign: 'center',
  justifySelf: 'center',
  gap: 5,
  background: 'rgba(255,255,255,0.2)',
  [theme.breakpoints.down('sm')]: {
    background: theme.palette.common.white,
    boxShadow: '0 0 10px 0 rgba(0,0,0,0.19)',
  },
}));

const MenuLink = styled(NavLink)<{ disabled?: boolean }>(({ theme, disabled }) => ({
  padding: '5px 19px',
  display: 'flex',
  alignItems: 'center',
  ...theme.typography.body1,
  color: `${theme.palette.common.black} !important`,
  textDecoration: 'none !important',
  lineHeight: 1,
  pointerEvents: disabled ? 'none' : 'visible',
  borderRadius: '18px',
  fontWeight: theme.typography.fontWeightBold,
  '&.active, &:hover': {
    background: theme.palette.common.white,
    [theme.breakpoints.down('sm')]: {
      background: theme.palette.primary.light,
      color: `${theme.palette.primary.main} !important`,
    },
  },

  '& span span': {
    color: theme.palette.primary.main,
    display: 'block',
    fontSize: 6,
  },
  [theme.breakpoints.down('sm')]: {
    '&.active': {
      color: `${theme.palette.primary.main} !important`,
    },
  },
}));

// eslint-disable-next-line import/prefer-default-export
export const AppMenu: FC = () => {
  const { chainId } = useActiveWeb3React();

  return (
    <Box
      sx={{
        bottom: ['0', ''],
        position: ['fixed', 'static'],
        justifySelf: 'center',
        alignItems: 'center',
        display: 'flex',
        padding: ['12px', 0],
        left: 0,
        right: 0,
        backdropFilter: 'blur(8px)',
        zIndex: 5,
        justifyContent: 'center',
      }}
    >
      <HeaderMenu>
        <MenuLink to="/">Dash</MenuLink>
        <MenuLink to="/stake">Stake</MenuLink>
        <MenuLink disabled={chainId === 1} to="/vaults">
          <span>
            Vault<span>coming soon</span>
          </span>
        </MenuLink>
      </HeaderMenu>
    </Box>
  );
};
