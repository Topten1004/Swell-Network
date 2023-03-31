import { createMulticall } from '@uniswap/redux-multicall';
// eslint-disable-next-line import/no-extraneous-dependencies
import { combineReducers, createStore } from 'redux';

import useActiveWeb3React from '../../hooks/useActiveWeb3React';
import { useInterfaceMulticall } from '../../hooks/useContract';
import useBlockNumber from '../hooks/useBlockNumber';

const multicall = createMulticall();
const reducer = combineReducers({ [multicall.reducerPath]: multicall.reducer });
export const store = createStore(reducer);

export default multicall;

// eslint-disable-next-line  @typescript-eslint/explicit-module-boundary-types
export function MulticallUpdater() {
  const latestBlockNumber = useBlockNumber();
  const { chainId } = useActiveWeb3React();
  const contract = useInterfaceMulticall();
  return <multicall.Updater chainId={chainId} contract={contract} latestBlockNumber={latestBlockNumber} />;
}
