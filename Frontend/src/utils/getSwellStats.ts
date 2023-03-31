import axios from 'axios';
import { ethers } from 'ethers';

import { subgraphEndPointUrl } from '../constants/links';

type SwellStatsInfo = {
  userCount: string;
  tvl: number;
  error: string | null;
};

if (!process.env.REACT_APP_SWELL_SUBGRAPH_API) {
  throw new Error(`REACT_APP_SWELL_SUBGRAPH_API must be a defined environment variable`);
}

export const getSwellStats = async (chainId: number): Promise<SwellStatsInfo> => {
  try {
    const graphqlQuery = {
      query: `{
          stats(id: "Swell-Stats"){
            id
            userCounter
            tvl
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
      data: graphqlQuery,
    });

    if (!response.data.data.stats) {
      return {
        userCount: '0',
        tvl: 0,
        error: null,
      };
    }

    return {
      userCount: response.data.data.stats.userCounter,
      tvl: Number(ethers.utils.formatEther(response.data.data.stats.tvl)),
      error: null,
    };
  } catch (error: any) {
    return {
      userCount: '',
      tvl: 0,
      error: error.message,
    };
  }
};

export const getReferredAmount = async (referralCode: string): Promise<string> => {
  try {
    const referralQuery = {
      query: `{
        referral(id: "${referralCode}"){
          id
            totalAmount
          }
        }`,
      variables: null,
    };

    const response = await axios({
      url: subgraphEndPointUrl[5],
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      data: referralQuery,
    });
    return response.data.data.referral ? ethers.utils.formatEther(response.data.data.referral.totalAmount) : '0';
  } catch (error: any) {
    return '0';
  }
};
