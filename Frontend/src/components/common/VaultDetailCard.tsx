import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Card, CardContent, CardHeader, CardProps } from '@mui/material';

interface IVaultDetailCard extends CardProps {
  title: string;
  content: any;
  contentMore: any;
}

const VaultDetailCard: React.FC<IVaultDetailCard> = ({ title, content, contentMore, ...props }) => {
  const [isReadMore, setIsReadMore] = useState(true);
  return (
    <Card {...props}>
      <CardHeader sx={{ '& .MuiTypography-root': { m: 0, fontSize: '16px' } }} title={title} />
      <CardContent sx={{ fontSize: '14px', fontWeight: 400 }}>
        {content} {!isReadMore && contentMore}
      </CardContent>
      {/* eslint-disable-next-line react/jsx-max-props-per-line */}
      <LoadingButton fullWidth onClick={() => setIsReadMore(!isReadMore)} size="small" sx={{ paddingBlock: '10px' }}>
        {isReadMore ? 'Load More' : ' Load Less'}
      </LoadingButton>
    </Card>
  );
};
export default VaultDetailCard;
