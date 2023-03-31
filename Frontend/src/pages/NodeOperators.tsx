import React from 'react';

import { Card, Typography } from '@mui/material';

import NodeOperatorCard from '../components/nodeOperators/NodeOperatorCard';

const NodeOperators: React.FC = () => (
  <>
    <Typography
      component="h2"
      sx={{
        marginBottom: '40px',
        textAlign: 'center',
      }}
      variant="h2"
    >
      Node Operators
    </Typography>
    <Card
      sx={{
        padding: ['20px', '60px 25px'],
      }}
    >
      <NodeOperatorCard sx={{ maxWidth: '550px', marginInline: 'auto' }} />
    </Card>
  </>
);
export default NodeOperators;
