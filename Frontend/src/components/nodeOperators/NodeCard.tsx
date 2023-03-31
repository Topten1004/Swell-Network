import React from 'react';

import { Card, useTheme } from '@mui/material';

interface IProps {
  onClick: () => void;
}

const NodeCard: React.FC<IProps> = ({ onClick, children }) => {
  const theme = useTheme();
  return (
    <Card
      onClick={onClick}
      sx={{
        backgroundColor: theme.palette.common.white,
        border: `1px solid ${theme.palette.grey[200]}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 15px',
        gap: '10px',
        borderRadius: '15px !important',
        cursor: 'pointer',
        '& > svg:not(.forward-icon)': {
          color: theme.palette.primary.main,
        },
      }}
    >
      {children}
    </Card>
  );
};
export default NodeCard;
