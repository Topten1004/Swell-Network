import { useMemo } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import { Contract } from '@ethersproject/contracts';
// eslint-disable-next-line import/no-extraneous-dependencies
import UniswapInterfaceMulticallJson from '@uniswap/v3-periphery/artifacts/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json';

// eslint-disable-next-line import/no-extraneous-dependencies
import { MULTICALL_ADDRESS, POAP_ADDRESS, SWETH_ADDRESS, SWNFT_ADDRESS } from '../constants/addresses';
import ERC20ABI from '../shared/abi/erc20.json';
import StrategyABI from '../shared/abi/IStrategy.json';
import POAPABI from '../shared/abi/POAP.json';
import SWNFTUpgradeABI from '../shared/abi/SWNFTUpgrade.json';
import VaultManagerABI from '../shared/abi/VaultManager.json';
import { UniswapInterfaceMulticall } from '../types/v3';
import { getContract } from '../utils';
import useActiveWeb3React from './useActiveWeb3React';

const { abi: MulticallABI } = UniswapInterfaceMulticallJson;

// returns null on errors
// eslint-disable-next-line import/prefer-default-export
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  // eslint-disable-next-line  @typescript-eslint/explicit-module-boundary-types
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { library, account, chainId } = useActiveWeb3React();

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null;
    let address: string | undefined;
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap;
    else address = addressOrAddressMap[chainId];
    if (!address) return null;
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to get contract', error);
      return null;
    }
  }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account]) as T;
}
// eslint-disable-next-line  @typescript-eslint/explicit-module-boundary-types
export function useInterfaceMulticall() {
  return useContract<UniswapInterfaceMulticall>(MULTICALL_ADDRESS, MulticallABI, false) as UniswapInterfaceMulticall;
}

export function useSwNftContract(withSignerIfPossible?: boolean): Contract | null {
  return useContract(SWNFT_ADDRESS, SWNFTUpgradeABI, withSignerIfPossible);
}
export function useSWETHContract(withSignerIfPossible?: boolean): Contract | null {
  return useContract(SWETH_ADDRESS, ERC20ABI, withSignerIfPossible);
}
export function useStrategyContract(strategyAddress: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(strategyAddress, StrategyABI, withSignerIfPossible);
}
export function usePOAPContract(withSignerIfPossible?: boolean): Contract | null {
  return useContract(POAP_ADDRESS, POAPABI, withSignerIfPossible); // @TODO update POAP contractsABI
}
export function useVaultManagerContract(vaultManagerAddress: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(vaultManagerAddress, VaultManagerABI, withSignerIfPossible);
}
