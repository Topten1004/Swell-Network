import { SupportedChainId } from '../constants/chains';

const DEFAULT_NETWORKS = [SupportedChainId.MAINNET, SupportedChainId.GOERLI, SupportedChainId.KALEIDO];

// eslint-disable-next-line import/prefer-default-export
export function constructSameAddressMap<T extends string>(
  address: T,
  additionalNetworks: SupportedChainId[] = []
): { [chainId: number]: T } {
  return DEFAULT_NETWORKS.concat(additionalNetworks).reduce<{ [chainId: number]: T }>((memo, chainId) => {
    // eslint-disable-next-line no-param-reassign
    memo[chainId] = address;
    return memo;
  }, {});
}
