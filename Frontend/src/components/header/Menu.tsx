import { FC, MouseEvent, useContext, useState } from 'react';
import { MoreHorizontal } from 'react-feather';
import { useNavigate } from 'react-router-dom';

import Brightness4Icon from '@mui/icons-material/Brightness4';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useTheme } from '@mui/material';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { SupportedChainId } from '../../constants/chains';
import useActiveWeb3React from '../../hooks/useActiveWeb3React';
import { ColorModeContext } from '../../theme/index';
import { getItem, setItem } from '../../utils/helper';

const options = [{ label: 'Node Operators', link: '/node-operators' }];

const kaleidoOptions = [{ label: 'Kaleido Faucet', link: '/kaleido-faucet' }];
const goerliOptions = [{ label: 'Goerli Faucet', link: '/goerli-faucet' }];

const ITEM_HEIGHT = 48;

const MoreMenu: FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { chainId } = useActiveWeb3React();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const colorMode = useContext(ColorModeContext);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const themeModeHandleClick = () => {
    colorMode.toggleColorMode();
    const themeMode = getItem('userThemeMode');
    setItem('userThemeMode', themeMode === 'light' ? 'dark' : 'light');
  };

  let expandedOptions = [...options];
  if (chainId === SupportedChainId.KALEIDO) expandedOptions = [...expandedOptions, ...kaleidoOptions];
  if (chainId === SupportedChainId.GOERLI) expandedOptions = [...expandedOptions, ...goerliOptions];

  return (
    <>
      <IconButton
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        aria-label="more"
        id="long-button"
        onClick={handleClick}
        sx={{
          background: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.grey['200'],
          width: {
            xs: 30,
            lg: 40,
          },
          padding: 0,
          height: {
            xs: 30,
            lg: 36,
          },
          borderRadius: '9px',
        }}
      >
        <MoreHorizontal />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        onClose={handleClose}
        open={open}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: 'fit-content',
            marginTop: 2,
          },
        }}
        sx={{
          '& ul': {
            margin: 0,
            padding: 0,
          },
          '& .MuiPaper-root': {
            boxShadow: '0 0 8px 0 rgba(0,0,0,0.11)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {expandedOptions.map((option) => (
          <MenuItem
            key={option.label}
            onClick={() => {
              setAnchorEl(null);
              navigate(option.link);
            }}
            sx={{ fontWeight: 'bold', padding: '8px 17px' }}
          >
            {option.label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => themeModeHandleClick()} sx={{ fontWeight: 'bold', padding: '8px 17px' }}>
          {theme.palette.mode === 'light' ? 'Dark' : 'Light'} Theme
          {theme.palette.mode === 'dark' ? (
            <Brightness4Icon sx={{ ml: 1 }} />
          ) : (
            <LightModeOutlinedIcon sx={{ ml: 1 }} />
          )}
        </MenuItem>
      </Menu>
    </>
  );
};

export default MoreMenu;
