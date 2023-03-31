import { FC } from 'react';

import { InfoOutlined } from '@mui/icons-material';
import { IconButton, Tooltip, TooltipProps } from '@mui/material';

// eslint-disable-next-line import/prefer-default-export
export const MuiTooltip: FC<Omit<TooltipProps, 'children'>> = (props) => (
  <Tooltip {...props}>
    <IconButton
      sx={{
        width: 14,
        height: 14,
        padding: 0,
        margin: '0 1px',
        verticalAlign: 'middle',
        '& svg': {
          width: 14,
          height: 14,
        },
      }}
    >
      <InfoOutlined />
    </IconButton>
  </Tooltip>
);
