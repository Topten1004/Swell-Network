import { styled } from '@mui/material';

import { ListColumn } from '../../theme/uiComponents';

export const VaultName = styled(ListColumn)(() => ({
  padding: 0,
  '& > span': {
    fontSize: 22,
    fontWeight: 600,
    marginLeft: 1,
  },
}));

export const ButtonGroupWrapper = styled('div')(({ theme }) => ({
  display: 'grid',
  gridGap: 10,
  gridTemplateColumns: '1fr 1fr',
  '& .MuiButton-root': {
    color: theme.palette.primary.main,
    backgroundColor: 'rgba(0,176,240,0.2)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    background: theme.palette.common.white,
    padding: '10px',
    borderRadius: '0 0 8px 8px',
  },
}));

export const VaultContent = styled('div')(({ theme }) => ({
  display: 'grid',
  marginBottom: 20,
  padding: '10px 0',
  gridGap: '0px 15px',
  paddingRight: '20px',
  justifyItems: 'start',
  gridTemplateColumns: '4fr 1fr',
  [theme.breakpoints.between('sm', 'md')]: {
    gridGap: '0px 10px',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    paddingRight: '0px',
    paddingBottom: 0,
  },
}));
export const Column = styled(ListColumn)({
  '& > span': {
    marginLeft: '20px',
  },
});
