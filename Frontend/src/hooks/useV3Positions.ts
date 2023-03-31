import { useMemo } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethers';

import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from '../lib/hooks/multicall';
import { PositionDetails } from '../types/position';
import { useSwNftContract } from './useContract';

interface UseV3PositionsResults {
  loading: boolean;
  positions: PositionDetails[] | undefined;
}

interface UseGetYourPositionResults {
  loading: boolean;
  totalPositions: number;
  totalValue: number;
  totalBaseTokenBalance: number;
}

export function useV3PositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseV3PositionsResults {
  const swNFTContract = useSwNftContract();
  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds]);
  const results = useSingleContractMultipleData(swNFTContract, 'positions', inputs);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const loading = useMemo(() => results.some(({ loading }) => loading), [results]);
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const error = useMemo(() => results.some(({ error }) => error), [results]);

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i];
        const result = call.result as CallStateResult;
        return {
          tokenId,
          pubKey: result.pubKey,
          value: result.value,
          baseTokenBalance: result.baseTokenBalance,
          timeStamp: result.timeStamp,
          operator: result.operator,
        };
      });
    }
    return undefined;
  }, [loading, error, results, tokenIds]);

  return {
    loading,
    positions: positions?.map((position, i) => ({ ...position, tokenId: inputs[i][0] })),
  };
}

interface UseV3PositionResults {
  loading: boolean;
  position: PositionDetails | undefined;
}

export function useV3PositionFromTokenId(tokenId: BigNumber | undefined): UseV3PositionResults {
  const position = useV3PositionsFromTokenIds(tokenId ? [tokenId] : undefined);
  return {
    loading: position.loading,
    position: position.positions?.[0],
  };
}

export function useV3Positions(account: string | null | undefined): UseV3PositionsResults {
  const swNFTContract = useSwNftContract();

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(swNFTContract, 'balanceOf', [
    account ?? undefined,
  ]);

  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber();

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests = [];
      for (let i = 0; i < accountBalance; i += 1) {
        tokenRequests.push([account, i]);
      }
      return tokenRequests;
    }
    return [];
  }, [account, accountBalance]);

  const tokenIdResults = useSingleContractMultipleData(swNFTContract, 'tokenOfOwnerByIndex', tokenIdsArgs);
  const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults]);

  const tokenIds = useMemo(() => {
    if (account) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is CallStateResult => !!result)
        .map((result) => BigNumber.from(result[0]))
        .sort((a: BigNumber, b: BigNumber) => (a.lt(b) ? 1 : -1));
    }
    return [];
  }, [account, tokenIdResults]);

  const { positions, loading: positionsLoading } = useV3PositionsFromTokenIds(tokenIds);

  return {
    loading: someTokenIdsLoading || balanceLoading || positionsLoading,
    positions,
  };
}

export const useGetYourPosition = (account: string | null | undefined): UseGetYourPositionResults => {
  const swNFTContract = useSwNftContract();

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(swNFTContract, 'balanceOf', [
    account ?? undefined,
  ]);

  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber();

  const { positions, loading: positionsLoading } = useV3Positions(account);

  const totalValue =
    !positionsLoading && positions && positions.length > 0
      ? positions
          .map((position) => ethers.utils.formatUnits(position.value.toString()))
          .reduce((prev, current) => Number(current) + prev, 0)
      : 0;
  const totalBaseTokenBalance =
    !positionsLoading && positions && positions.length > 0
      ? positions
          .map((position) => ethers.utils.formatUnits(position.baseTokenBalance).toString())
          .reduce((prev, current) => Number(current) + prev, 0)
      : 0;

  return {
    loading: balanceLoading || positionsLoading,
    totalPositions: accountBalance || 0,
    totalValue,
    totalBaseTokenBalance,
  };
};
