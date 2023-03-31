import React from 'react';

import { Card, Typography, useTheme } from '@mui/material';

const RegisterStepOne: React.FC = () => {
  const theme = useTheme();
  return (
    <>
      <Card
        sx={{
          border: `2px solid ${theme.palette.common.white}`,
          borderRadius: '8px',
          padding: '34px 30px',
          [theme.breakpoints.down('sm')]: {
            padding: 0,
            border: 0,
          },
          mb: '40px',
          '& pre': {
            marginBottom: '20px',
          },
        }}
      >
        <Typography component="p" sx={{ mb: '10px' }}>
          Step 1
        </Typography>
        <Typography
          component="h4"
          sx={{
            mb: '20px',
            fontSize: '22px',
            fontWeight: '600',
          }}
          variant="h4"
        >
          Create deposit data with ethdo
        </Typography>
        <p>
          The steps to creating your validator public key and subsequent deposit data sets are documented on our docs
          site below.
        </p>
        <p>
          <a
            href="https://docs.swellnetwork.io/node-operator-guide/create-deposit-data"
            rel="noopener noreferrer"
            target="_blank"
          >
            https://docs.swellnetwork.io/node-operator-guide/create-deposit-data
          </a>
        </p>

        <p>Follow the guide, generate the deposit data sets you need and return to complete step 2.</p>
      </Card>
    </>
  );
};

export default RegisterStepOne;
