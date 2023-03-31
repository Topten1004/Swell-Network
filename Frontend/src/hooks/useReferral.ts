import { useCallback, useEffect, useState } from 'react';

import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { subgraphEndPointUrl } from '../constants/links';
import { displayErrorMessage } from '../utils/errors';

export default function useReferral(): { referrals: any[] } {
  const { enqueueSnackbar } = useSnackbar();
  const { chainId } = useWeb3React();

  const [referrals, setReferrals] = useState<any[]>([]);

  const fetchReferrals = useCallback(async () => {
    if (!chainId) {
      setReferrals([]);
      return;
    }
    if (chainId === 2077117572) {
      return;
    }
    try {
      const referralQuery = {
        query: `{
          referrals(orderBy: totalAmount, orderDirection: desc){
            id
              totalAmount
            }
          }`,
        variables: null,
      };

      if (!subgraphEndPointUrl[chainId]) {
        throw new Error(`Not supported network`);
      }

      const response = await axios({
        url: subgraphEndPointUrl[chainId],
        method: 'post',
        headers: {
          'Content-type': 'application/json',
        },
        data: referralQuery,
      });
      setReferrals(
        response.data.data.referrals.filter((row: any) => row.id !== '' && row.id.toLowerCase() !== 'swell')
      );
    } catch (error: any) {
      displayErrorMessage(enqueueSnackbar, error);
    }
  }, [chainId, enqueueSnackbar]);

  useEffect(() => {
    fetchReferrals();
    setInterval(() => {
      fetchReferrals();
    }, 300000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return { referrals };
}
