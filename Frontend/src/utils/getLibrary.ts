// eslint-disable-next-line import/no-extraneous-dependencies
import { Web3Provider } from '@ethersproject/providers';

// eslint-disable-next-line  @typescript-eslint/explicit-module-boundary-types
export default function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(
    provider,
    // eslint-disable-next-line no-nested-ternary
    typeof provider.chainId === 'number'
      ? provider.chainId
      : typeof provider.chainId === 'string'
      ? // eslint-disable-next-line radix
        parseInt(provider.chainId)
      : 'any'
  );
  library.pollingInterval = 15_000;
  return library;
}
