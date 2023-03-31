import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { EMPTY } from '@web3-react/empty';
import { Connector } from '@web3-react/types';
import { atomWithDefault, useAtomValue } from 'jotai/utils';

const [connector, hooks] = initializeConnector(() => EMPTY);
const EMPTY_CONNECTOR: [Connector, Web3ReactHooks] = [connector, hooks];
const web3Atom = atomWithDefault<ReturnType<typeof hooks.useWeb3React>>(() => ({
  connector: EMPTY_CONNECTOR[0],
  library: undefined,
  chainId: undefined,
  account: undefined,
  active: false,
  error: undefined,
}));

// eslint-disable-next-line  @typescript-eslint/explicit-module-boundary-types
export default function useActiveWeb3React() {
  return useAtomValue(web3Atom);
}
