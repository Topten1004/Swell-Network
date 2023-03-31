import { FC, useEffect, useMemo, useState } from 'react';

import { Grid, styled } from '@mui/material';
import { ethers } from 'ethers';

import MedalFirstIcon from '../../../assets/images/medal-1st.svg';
import MedalSecondIcon from '../../../assets/images/medal-2nd.svg';
import MedalThirdIcon from '../../../assets/images/medal-3rd.svg';
import { shortenAddress } from '../../../utils';
import { formatPrice } from '../../../utils/formatPrice';
import { getEthPrice } from '../../../utils/price';

const TopRankingContainer = styled('div')(() => ({}));

const TopRankCard = styled('div')(({ theme }) => ({
  backgroundColor: '#ECF8FC',
  textAlign: 'center',
  color: theme.palette.text.secondary,
  border: '2px solid #FFFFFF',
  borderRadius: '8px',
  padding: '8px',
}));

const AddressRow = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const MedalIconWrapper = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '7px',
});

const AddressCell = styled('div')(() => ({
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: '16px',
  lineHeight: '150%',
  textAlign: 'center',
  color: '#5E6364',
  margin: 'auto',
  letterSpacing: '-0.011em',
}));

const AmountInEthRow = styled('div')(({ rank }: { rank: number }) => ({
  ...{
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: '24px',
    lineHeight: '150%',
    textAlign: 'center',
    margin: 'auto',
    letterSpacing: '-0.011em',
  },
  ...(rank === 1 && {
    marginTop: '29px',
    color: '#F49F0A',
  }),
  ...(rank === 2 && {
    marginTop: '9px',
    color: '#5E6364',
  }),
  ...(rank === 3 && {
    marginTop: '0px',
    color: '#CCCCCC',
  }),
}));

const AmountInUsdRow = styled('div')(() => ({
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: '700',
  fontSize: '16px',
  lineHeight: '150%',
  textAlign: 'center',
  color: '#5E6364',
  margin: 'auto',
  letterSpacing: '-0.011em',
}));

interface ITopRankingProps {
  referralsWithWallet: any[];
}

const TopRanking: FC<ITopRankingProps> = ({ referralsWithWallet }) => {
  const [ethPriceInUsd, setEthPriceInUsd] = useState<number>(1);

  const fetchEthPrice = async () => {
    const ethPrice = await getEthPrice();
    setEthPriceInUsd(ethPrice);
  };

  useEffect(() => {
    fetchEthPrice();
  }, []);

  const topReferrers = useMemo(
    () =>
      referralsWithWallet &&
      referralsWithWallet.slice(0, 3).map((row: any) => ({
        amountInEth: ethers.utils.formatEther(row.totalAmount),
        amountInUsd: Number(ethers.utils.formatEther(row.totalAmount)) * ethPriceInUsd,
        wallet: row.wallet,
      })),
    [referralsWithWallet, ethPriceInUsd]
  );

  return (
    <TopRankingContainer>
      <Grid container spacing={3} sx={{ alignItems: 'end' }}>
        <Grid item xs={4}>
          <TopRankCard>
            <AddressRow>
              <MedalIconWrapper>
                <img alt="medal second" src={MedalSecondIcon} />
              </MedalIconWrapper>
              <AddressCell>
                {topReferrers[1] && topReferrers[1].wallet && topReferrers[1].wallet.length > 0
                  ? shortenAddress(topReferrers[1].wallet, 3)
                  : ''}
              </AddressCell>
            </AddressRow>
            <AmountInEthRow rank={2}>{`${Number(topReferrers[1]?.amountInEth) || '--'} ETH`}</AmountInEthRow>
            <AmountInUsdRow>{`$${formatPrice(Number(topReferrers[1]?.amountInUsd)) || '--'}`}</AmountInUsdRow>
          </TopRankCard>
        </Grid>
        <Grid item xs={4}>
          <TopRankCard>
            <AddressRow>
              <MedalIconWrapper>
                <img alt="medal first" src={MedalFirstIcon} />
              </MedalIconWrapper>
              <AddressCell>
                {topReferrers[0] && topReferrers[0].wallet && topReferrers[0].wallet.length > 0
                  ? shortenAddress(topReferrers[0].wallet, 3)
                  : ''}
              </AddressCell>
            </AddressRow>
            <AmountInEthRow rank={1}>{`${Number(topReferrers[0]?.amountInEth) || '--'} ETH`}</AmountInEthRow>
            <AmountInUsdRow>{`$${formatPrice(Number(topReferrers[0]?.amountInUsd)) || '--'}`}</AmountInUsdRow>
          </TopRankCard>
        </Grid>
        <Grid item xs={4}>
          <TopRankCard>
            <AddressRow>
              <MedalIconWrapper>
                <img alt="medal third" src={MedalThirdIcon} />
              </MedalIconWrapper>
              <AddressCell>
                {topReferrers[2] && topReferrers[2].wallet && topReferrers[2].wallet.length > 0
                  ? shortenAddress(topReferrers[2].wallet, 3)
                  : ''}
              </AddressCell>{' '}
            </AddressRow>
            <AmountInEthRow rank={3}>{`${Number(topReferrers[2]?.amountInEth) || '--'} ETH`}</AmountInEthRow>
            <AmountInUsdRow>{`$${formatPrice(Number(topReferrers[2]?.amountInUsd)) || '--'}`}</AmountInUsdRow>
          </TopRankCard>
        </Grid>
      </Grid>
    </TopRankingContainer>
  );
};

export default TopRanking;
