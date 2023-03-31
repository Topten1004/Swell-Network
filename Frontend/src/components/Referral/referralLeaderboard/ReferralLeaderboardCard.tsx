import { FC, useEffect } from 'react';
import { Navigate } from 'react-router';

import { useLazyQuery } from '@apollo/client';
import { BoxProps, styled } from '@mui/material';

import useActiveWeb3React from '../../../hooks/useActiveWeb3React';
import useReferral from '../../../hooks/useReferral';
import { GET_USERS_BY_REFERRAL_CODES } from '../../../shared/graphql';
import RankingTable from './RankingTable';
import TopRanking from './TopRanking';

const CardWrapper = styled('div')({
  marginTop: '34px',
});

const ReferralLeaderboardCard: FC<BoxProps> = () => {
  const { chainId } = useActiveWeb3React();
  const { referrals } = useReferral();
  const [fetchUsersFromReferralCodes, { data: fetchedUserData }] = useLazyQuery(GET_USERS_BY_REFERRAL_CODES);

  const referralsWithWallet =
    referrals &&
    referrals
      .map((row) => ({
        ...row,
        wallet:
          (fetchedUserData &&
            fetchedUserData.getUsersByReferralCodes.find((row1: any) => row1.referralCode === row.id)?.wallet) ||
          '',
      }))
      .filter((row) => row.wallet.length > 0);

  useEffect(() => {
    const referralCodes = referrals.map((row) => row.id);

    fetchUsersFromReferralCodes({
      variables: {
        referralCodes,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referrals, fetchUsersFromReferralCodes]);

  if (chainId === 2077117572) {
    return <Navigate replace to="/" />;
  }
  return (
    <CardWrapper>
      <TopRanking referralsWithWallet={referralsWithWallet} />
      <RankingTable referralsWithWallet={referralsWithWallet} />
    </CardWrapper>
  );
};

export default ReferralLeaderboardCard;
