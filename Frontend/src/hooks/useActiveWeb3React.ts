/* eslint-disable react-hooks/rules-of-hooks */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from 'web3-react-core';

import { NetworkContextName } from '../constants/misc';
import useWidgetsWeb3React from '../lib/hooks/useActiveWeb3React';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const useActiveWeb3React = () => {
  if (process.env.REACT_APP_IS_WIDGET) {
    return useWidgetsWeb3React();
  }

  const interfaceContext = useWeb3React<Web3Provider>();
  const interfaceNetworkContext = useWeb3React<Web3Provider>(
    process.env.REACT_APP_IS_WIDGET ? undefined : NetworkContextName
  );

  if (interfaceContext.active) {
    return interfaceContext;
  }

  return interfaceNetworkContext;
};
export default useActiveWeb3React;
