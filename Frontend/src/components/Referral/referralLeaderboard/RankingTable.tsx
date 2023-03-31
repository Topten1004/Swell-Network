import { FC, useEffect, useState } from 'react';

import { Button, Card, styled } from '@mui/material';
import { ethers } from 'ethers';

import { shortenAddress } from '../../../utils';
import { formatPrice } from '../../../utils/formatPrice';
import { getEthPrice } from '../../../utils/price';

const ReferralRow = styled('div')(({ type }: { type?: string }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: '700',
  fontSize: '16px',
  lineHeight: '19px',
  textAlign: 'center',
  color: '#5E6364',
  margin: 'auto',
  letterSpacing: '-0.011em',
  paddingBottom: '17px',
  ...(type === 'body' && {
    borderBottom: '2px solid #FFFFFF',
    fontWeight: '500',
    paddingTop: '18px',
  }),
}));

const RankCell = styled('div')(({ rank }: { rank: number }) => ({
  width: '40px',
  '& div': {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid #CCCCCC',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...(rank === 1 && {
      border: 'none',
      backgroundColor: 'rgba(244,159,10,0.4)',
    }),
    ...(rank === 2 && {
      border: 'none',
      backgroundColor: 'rgba(0,176,240,0.4)',
    }),
    ...(rank === 3 && {
      border: 'none',
      backgroundColor: '#CCCCCC',
    }),
  },
}));

const AddressCell = styled('div')(() => ({
  width: '100px',
}));

const CodeCell = styled('div')(() => ({
  width: '100px',
}));

const AmountCell = styled('div')(() => ({
  width: '140px',
}));

const ConnectMoreButton = styled(Button)(() => ({
  display: 'flex',
  width: '140px',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: '700',
  fontSize: '16px',
  lineHeight: '19px',
  textAlign: 'center',
  color: '#00B0F0',
  margin: 'auto',
  letterSpacing: '-0.011em',
}));

const HeaderRow = () => (
  <ReferralRow>
    <div>Rank</div>
    <div>Address</div>
    <div>Referral code</div>
    <div>ETH | USD referred</div>
  </ReferralRow>
);

const BodyRow = ({ rank, ethPriceInUsd, referral }: { rank: number; ethPriceInUsd: number; referral: any }) => (
  <ReferralRow type="body">
    <RankCell rank={rank}>
      <div>{rank}</div>
    </RankCell>
    <AddressCell>
      {referral.wallet && referral.wallet.length > 0 ? shortenAddress(referral.wallet, 3) : referral.wallet}
    </AddressCell>
    <CodeCell>{referral.id}</CodeCell>
    <AmountCell>{`${Number(ethers.utils.formatEther(referral.totalAmount))} ETH | $${formatPrice(
      Number(ethers.utils.formatEther(referral.totalAmount)) * ethPriceInUsd
    )}`}</AmountCell>
  </ReferralRow>
);

interface IRankingTableProps {
  referralsWithWallet: any[];
}

const RankingTable: FC<IRankingTableProps> = ({ referralsWithWallet }) => {
  const [pageNum, setPageNum] = useState<number>(1);
  const [ethPriceInUsd, setEthPriceInUsd] = useState<number>(1);

  const ROWS_PER_PAGE = 20;

  const onClickMore = () => {
    if (referralsWithWallet.length > pageNum * ROWS_PER_PAGE) {
      setPageNum(pageNum + 1);
    }
  };

  const fetchEthPrice = async () => {
    const ethPrice = await getEthPrice();
    setEthPriceInUsd(ethPrice);
  };

  useEffect(() => {
    fetchEthPrice();
  }, []);

  return (
    <>
      <Card
        sx={{
          marginTop: '24px',
          marginBottom: '24px',
          padding: '34px',
        }}
      >
        <HeaderRow />
        {referralsWithWallet &&
          referralsWithWallet
            .slice(0, pageNum * ROWS_PER_PAGE)
            .map((referral, id) => (
              <BodyRow ethPriceInUsd={ethPriceInUsd} key={referral} rank={id + 1} referral={referral} />
            ))}
      </Card>
      <ConnectMoreButton onClick={onClickMore} size="medium" sx={{ fontWeight: 500 }} type="button" variant="text">
        Load more
      </ConnectMoreButton>
    </>
  );
};

export default RankingTable;
