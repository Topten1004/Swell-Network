import React, { useEffect, useState } from 'react';

import { useLazyQuery } from '@apollo/client';
import { Button, Card, styled, Typography, useTheme } from '@mui/material';
import { ethers } from 'ethers';
import { useWeb3React } from 'web3-react-core';

import MedalIcon from '../assets/images/medal-sm.svg';
import ReferralLeaderboardCard from '../components/Referral/referralLeaderboard/ReferralLeaderboardCard';
import useReferral from '../hooks/useReferral';
import { GET_USER_BY_WALLET } from '../shared/graphql';
import { useAppDispatch } from '../state/hooks';
import { setIsWalletModalOpen } from '../state/modal/modalSlice';
import { formatPrice } from '../utils/formatPrice';
import { getEthPrice } from '../utils/price';

const ReferralLeaderboardContainer = styled('div')(() => ({
  maxWidth: '600px',
  margin: 'auto',
}));

const GeneralInfo = styled('div')(() => ({
  marginBottom: '44px',
}));

const InfoText = styled('p')(() => ({
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

const StatisticsText = styled('p')<{ type?: string }>(({ theme, type }) => ({
  display: 'flex',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: '16px',
  lineHeight: '150%',
  textAlign: 'center',
  color: type === 'blue' ? theme.palette.primary.main : '#5E6364',
  margin: 'auto',
  letterSpacing: '-0.011em',
  whiteSpace: 'break-spaces',
}));

const MedalIconWrapper = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '7px',
});

const ButtonContainer = styled('div')(() => ({
  maxWidth: 440,
  margin: 'auto',
  marginTop: '44px',
}));

const ReferralLeaderboard: React.FC = () => {
  const [ethPriceInUsd, setEthPriceInUsd] = useState<number>(1);

  const { account } = useWeb3React();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { referrals } = useReferral();
  const [fetchUserData, { data: fetchedUserData }] = useLazyQuery(GET_USER_BY_WALLET);

  const fetchEthPrice = async () => {
    const ethPrice = await getEthPrice();
    setEthPriceInUsd(ethPrice);
  };

  useEffect(() => {
    fetchEthPrice();
  }, []);

  // fetch user data
  useEffect(() => {
    if (account) {
      fetchUserData({
        variables: {
          wallet: account,
        },
      });
    }
  }, [account, fetchUserData]);

  const referralCode = fetchedUserData?.getUserByWallet?.referralCode;
  const myReferralInfo = {
    ranking: referrals.map((row) => row.id).indexOf(referralCode) + 1,
    amountInEth: ethers.utils.formatEther(referrals.find((row) => row.id === referralCode)?.totalAmount || 0),
  };

  return (
    <ReferralLeaderboardContainer>
      <Typography
        component="h2"
        sx={{
          marginBottom: '24px',
          textAlign: 'center',
        }}
        variant="h2"
      >
        Referral Leaderboard
      </Typography>
      <GeneralInfo>
        <InfoText>
          {`These are Swell's the highest earning referral users. Get your name on the board by referring others to stake
          with your referral link and earn rewards today.`}
        </InfoText>
      </GeneralInfo>
      {account ? (
        <Card
          sx={{
            padding: '24px 34px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <StatisticsText>
            <span>{`My Rank: `}</span>
            <span>
              <b>{myReferralInfo.ranking || '-'}</b>
            </span>
          </StatisticsText>
          <StatisticsText>
            <span>{`Referred: `}</span>
            <span>
              <b>{`${Number(myReferralInfo.amountInEth)} ETH | $${formatPrice(
                Number(myReferralInfo.amountInEth) * ethPriceInUsd
              )}`}</b>
            </span>
          </StatisticsText>
          <StatisticsText type="blue">
            <MedalIconWrapper>
              <img alt="medal" src={MedalIcon} />
            </MedalIconWrapper>
            <span>
              <a href="./referral">My referral page</a>
            </span>
          </StatisticsText>
        </Card>
      ) : (
        <ButtonContainer>
          <Button
            fullWidth
            onClick={() => dispatch(setIsWalletModalOpen(true))}
            size="large"
            sx={{ color: theme.palette.grey.A400 }}
          >
            Connect wallet
          </Button>
        </ButtonContainer>
      )}
      <ReferralLeaderboardCard />
    </ReferralLeaderboardContainer>
  );
};

export default ReferralLeaderboard;
