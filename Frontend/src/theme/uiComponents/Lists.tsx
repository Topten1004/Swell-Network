import { alpha, styled } from '@mui/material';

export const List = styled('div')(({ theme }) => ({
  background: alpha(theme.palette.primary.contrastText, 0.5),
  borderRadius: 8,
  marginBottom: '18px',
  position: 'relative',
}));

export const ListHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  backgroundColor: theme.palette.primary.contrastText,
  padding: 15,
  borderRadius: '8px 8px 0px 0px',
}));

export const ListColumn = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '5px 15px',
  gap: 10,
  '& span': {
    fontWeight: 400,
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
}));
