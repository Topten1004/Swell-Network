import { FC, ReactNode, useCallback, useEffect, useState } from 'react';

import { Box, Button, Card, CardContent, CardHeader, CircularProgress, styled } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { useAppSelector } from '../../state/hooks';
import { MuiTooltip } from '../../theme/uiComponents';
import getAPR from '../../utils/getAPR';
import { getSwellStats } from '../../utils/getSwellStats';

type RowProps = {
  label: string | ReactNode;
  value: string;
  reload: any;
  error: boolean;
  loading: boolean;
};

const Row = styled(({ label, value, reload, error, loading, ...props }: RowProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <div {...props}>
    <Box>{label}</Box>
    {error ? (
      <Button
        onClick={reload}
        size="small"
        sx={{
          fontSize: 10,
          fontStyle: 'italic',
          display: 'block',
          textDecoration: 'underline',
          padding: 0,
          minWidth: 0,
        }}
        variant="text"
      >
        reload
      </Button>
    ) : (
      <small>{loading ? <CircularProgress size={15} /> : value}</small>
    )}
  </div>
))({
  display: 'flex',
  justifyContent: 'space-between',
  '&:not(:last-child)': {
    marginBottom: 20,
  },
  '& small': {
    fontWeight: 400,
    fontSize: 12,
    marginLeft: 20,
  },
});

const Statistics: FC = () => {
  const { chainId } = useWeb3React();
  const [tvl, setTvl] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const { APR, GetAPRError, loadingAPR } = useAppSelector((state) => state.stats);
  const [uniqueStakingWallets, setUniqueStakingWallets] = useState('');
  const [loadingSwellStats, setLoadingSwellStats] = useState(false);
  const [getSwellStatsError, setGetSwellStatsError] = useState(false);

  const loadSwellStats = useCallback(async () => {
    setGetSwellStatsError(false);
    setLoadingSwellStats(true);
    const response = await getSwellStats(chainId || 1);
    if (!response.error) {
      setUniqueStakingWallets(response.userCount);
      setTvl(response.tvl);
    } else {
      setGetSwellStatsError(true);
      enqueueSnackbar('Load Swell Stats Error', { variant: 'error' });
    }
    setLoadingSwellStats(false);
  }, [enqueueSnackbar, chainId]);

  useEffect(() => {
    loadSwellStats();
    getAPR();
  }, [loadSwellStats, chainId]);

  return (
    <Card>
      <CardHeader
        sx={{
          '& span': {
            display: 'flex',
            marginBottom: 0,
            justifyContent: 'space-between',
            '& svg': {
              transform: 'rotate(180deg)',
            },
          },
        }}
        title={
          <>
            <span>Swell Stats</span>
          </>
        }
      />
      <CardContent>
        <Row
          error={getSwellStatsError}
          label="TVL(Total ETH staked)"
          loading={loadingSwellStats}
          reload={loadSwellStats}
          value={`${tvl} ETH`}
        />
        <Row
          error={GetAPRError}
          label={
            <>
              APR <MuiTooltip title="Annual Percentage Rate" />
            </>
          }
          loading={loadingAPR}
          reload={getAPR}
          value={`${APR}%`}
        />
        <Row
          error={getSwellStatsError}
          label="Unique staking wallets"
          loading={loadingSwellStats}
          reload={loadSwellStats}
          value={uniqueStakingWallets}
        />
      </CardContent>
    </Card>
  );
};

export default Statistics;
