import { FC } from 'react';

import { alpha, Button, Card, CardContent, CardHeader, styled } from '@mui/material';

import { List, ListColumn, SwellIcon } from '../../theme/uiComponents';

const Wrapper = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '90px auto',
  justifyItems: 'start',
  span: {
    color: alpha('#000', 0.5),
    marginLeft: 10,
    fontSize: 11,
  },
}));

const PositionHistory: FC = () => (
  <Card sx={{ mb: '20px' }}>
    <CardHeader title="Position History" />
    <CardContent sx={{ textAlign: 'center', padding: '8px 20px 22px 15px' }}>
      <List
        sx={{
          marginBottom: 0,
          backgroundColor: 'unset',
          div: { padding: '0px 0px 13px 0px' },
        }}
      >
        <ListColumn>
          <Wrapper>
            Exited vault <span>24/01/2022</span>
          </Wrapper>
          <span>
            <SwellIcon size="xs" />
            0.00
          </span>
        </ListColumn>
        <ListColumn>
          <Wrapper>
            Entered vault <span>24/01/2022</span>
          </Wrapper>
          <span>
            <SwellIcon size="xs" />
            0.00
          </span>
        </ListColumn>
        <ListColumn>
          <Wrapper>
            Withdrawal <span>24/01/2022</span>
          </Wrapper>
          <span>
            <SwellIcon size="xs" />
            0.00
          </span>
        </ListColumn>
      </List>
      <Button size="small" sx={{ fontWeight: 500, marginTop: '2px' }} variant="text">
        Load more
      </Button>
    </CardContent>
  </Card>
);

export default PositionHistory;
