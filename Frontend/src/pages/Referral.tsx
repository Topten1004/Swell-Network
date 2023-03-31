import React from 'react';

import { Typography } from '@mui/material';

import ReferralInformationCard from '../components/Referral/referralInformation';

const Referral: React.FC = () => (
  <>
    <Typography
      component="h2"
      sx={{
        marginBottom: '40px',
        textAlign: 'center',
      }}
      variant="h2"
    >
      Referral
    </Typography>
    <ReferralInformationCard sx={{ maxWidth: '550px', marginInline: 'auto' }} />
  </>
);

export default Referral;
