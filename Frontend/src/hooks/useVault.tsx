/* eslint-disable import/no-extraneous-dependencies, import/prefer-default-export, no-param-reassign */

import { useMemo } from 'react';

import { Interface } from '@ethersproject/abi';
import { BigNumber, ethers } from 'ethers';

import { VAULT_INFO, VaultInfo } from '../constants/vaults';
import {
  CallStateResult,
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from '../lib/hooks/multicall';
import StrategyABI from '../shared/abi/IStrategy.json';
import useActiveWeb3React from './useActiveWeb3React';
import { useStrategyContract, useSwNftContract, useVaultManagerContract } from './useContract';
import { useV3Positions } from './useV3Positions';

interface UseVault {
  loading: boolean;
  vaults: any[];
  totalVaults: number;
}

function useVaultManagerAddress(): { loading: boolean; vaultManagerAddress: string } {
  const swNFTContract = useSwNftContract();

  const results = useSingleCallResult(swNFTContract, 'vaultManager');

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const loading = useMemo(() => [results].some(({ loading }) => loading), [results]);
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const error = useMemo(() => [results].some(({ error }) => error), [results]);

  const vaultManagerAddress = useMemo(() => {
    if (!loading && !error) {
      return [results].map((call) => {
        const result = call.result as CallStateResult;
        return result && result[0].toString();
      });
    }
    return undefined;
  }, [loading, error, results]);
  if (vaultManagerAddress) {
    return { loading, vaultManagerAddress: vaultManagerAddress[0] };
  }
  return { loading, vaultManagerAddress: '' };
}

function useStrategyLength(): { loading: boolean; strategiesCount: number } | undefined {
  const vaultManager = useVaultManagerAddress();

  const vaultManagerContract = useVaultManagerContract(vaultManager.vaultManagerAddress);

  const results = useSingleCallResult(vaultManagerContract, 'getStrategyLength');

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const loading = useMemo(() => [results].some(({ loading }) => loading), [results]);
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const error = useMemo(() => [results].some(({ error }) => error), [results]);

  const strategyCount = useMemo(() => {
    if (!loading && !error) {
      return [results].map((call) => {
        const result = call.result as CallStateResult;
        return result && result[0].toNumber();
      });
    }
    return undefined;
  }, [loading, error, results]);
  if (strategyCount) {
    return { loading, strategiesCount: strategyCount[0] };
  }
  return { loading, strategiesCount: 0 };
}

export function useStrategiesAddress(indexes: number[] | number): { loading: boolean; strategies: any } {
  const vaultManager = useVaultManagerAddress();

  const vaultManagerContract = useVaultManagerContract(vaultManager.vaultManagerAddress);

  const inputs = useMemo(
    () => (typeof indexes === 'number' ? [[BigNumber.from(indexes)]] : indexes.map((index) => [BigNumber.from(index)])),
    [indexes]
  );
  const results = useSingleContractMultipleData(vaultManagerContract, 'getStrategyIndex', inputs);
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const loading = useMemo(() => results.some(({ loading }) => loading), [results]);
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const error = useMemo(() => results.some(({ error }) => error), [results]);

  const strategies = useMemo(() => {
    if (!loading && !error) {
      return results.map((call) => {
        const [result] = call.result as CallStateResult;
        return result;
      });
    }
    return [];
  }, [loading, error, results]);
  return { loading, strategies };
}

function useGetVaultBalance(
  address: string,
  tokenIds: BigNumber[] | undefined
): { loading: boolean; positions: { position: BigNumber; balance: BigNumber }[]; balance: number } {
  const strategyContract = useStrategyContract(address);
  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [tokenId]) : []), [tokenIds]);
  const results = useSingleContractMultipleData(strategyContract, 'positions', inputs);
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const loading = useMemo(() => results.some(({ loading }) => loading), [results]);
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const error = useMemo(() => results.some(({ error }) => error), [results]);

  const positions = useMemo(() => {
    if (!loading && !error) {
      return results
        .map((call, index) => {
          const [data] = call.result as CallStateResult;
          return { position: inputs[index][0], balance: data as BigNumber };
        })
        .filter((position) => position.balance.gt(BigNumber.from(0)));
    }
    return [];
  }, [error, inputs, loading, results]);
  const balance = useMemo(() => {
    if (!loading && !error) {
      return positions
        .map((position) => ethers.utils.formatUnits(position.balance.toString()))
        .reduce((prev, current) => Number(current) + prev, 0);
    }
    return 0;
  }, [loading, error, positions]);
  return { loading, positions, balance };
}

function useVaultInfo(address?: string): VaultInfo | undefined {
  const { chainId } = useActiveWeb3React();
  return VAULT_INFO[chainId || 0]?.[address?.toLowerCase() || ''];
}

export function useVaultDetail(
  index: number,
  account: string | null | undefined
): {
  loading: boolean;
  vaultDetail: {
    address: string;
    positions: { position: BigNumber; balance: BigNumber }[];
    balance: number | undefined;
    averageAPR: number;
    averageAPY: number;
    info?: VaultInfo;
  };
} {
  const {
    loading: loadingVaultAddress,
    strategies: [address],
  } = useStrategiesAddress(index);

  const { loading: loadingPositions, positions } = useV3Positions(account);
  const tokenIds = positions?.map((position) => position.tokenId);
  const { loading: balancesLoading, balance, positions: enteredPositions } = useGetVaultBalance(address, tokenIds);
  const info = useVaultInfo(address);
  return {
    loading: loadingPositions || balancesLoading || loadingVaultAddress,
    vaultDetail: { address, positions: enteredPositions, balance, averageAPR: 5, averageAPY: 5, info },
  };
}

export function useVaults(startIndex = 0, endIndex = 5): UseVault {
  const countOfStrategies = useStrategyLength();
  const indexes = [];
  if (countOfStrategies && countOfStrategies.strategiesCount > 0) {
    if (endIndex > countOfStrategies.strategiesCount) {
      endIndex = countOfStrategies.strategiesCount - 1;
    }
    for (let i = startIndex; i <= endIndex; i += 1) {
      indexes.push(i);
    }
  }
  const vaultAddresses = useStrategiesAddress(indexes);

  return {
    loading: countOfStrategies?.loading || vaultAddresses.loading,
    vaults: vaultAddresses.strategies,
    totalVaults: countOfStrategies?.strategiesCount || 0,
  };
}
const StrategyInterface = new Interface(StrategyABI);
export function useAllVaultsWithPositions(tokenId: BigNumber): [{ [key: string]: BigNumber }, boolean] {
  const countOfStrategies = useStrategyLength();
  const allVaults = useVaults(0, countOfStrategies ? countOfStrategies.strategiesCount - 1 : 1);
  const balances = useMultipleContractSingleData(
    allVaults.vaults,
    StrategyInterface,
    'positions',
    useMemo(() => [tokenId], [tokenId])
  );

  const anyLoading: boolean = useMemo(
    () => balances.some((callState: { loading: any }) => callState.loading),
    [balances]
  );
  return useMemo(
    () => [
      tokenId && allVaults.totalVaults > 0
        ? allVaults.vaults.reduce<{ [vault: string]: BigNumber }>((memo, token, i) => {
            const value = balances?.[i]?.result?.[0];
            if (value) {
              // eslint-disable-next-line no-param-reassign
              memo[token] = value;
            }
            return memo;
          }, {})
        : {},
      anyLoading,
    ],
    [allVaults.totalVaults, allVaults.vaults, anyLoading, balances, tokenId]
  );
}
