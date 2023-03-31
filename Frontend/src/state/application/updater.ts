import { useEffect, useState } from 'react';

import useActiveWeb3React from '../../hooks/useActiveWeb3React';
import useDebounce from '../../hooks/useDebounce';
import useIsWindowVisible from '../../hooks/useIsWindowVisible';
import { supportedChainId } from '../../utils/supportedChainId';
import { useAppDispatch } from '../hooks';
import { setSelectedNodeOperator } from '../nodeOperator/nodeOperatorSlice';
import { updateChainId } from './reducer';

export default function Updater(): null {
  const { chainId, library } = useActiveWeb3React();
  const dispatch = useAppDispatch();
  const windowVisible = useIsWindowVisible();

  const [activeChainId, setActiveChainId] = useState(chainId);

  useEffect(() => {
    if (library && chainId && windowVisible) {
      setActiveChainId(chainId);
    }
  }, [dispatch, chainId, library, windowVisible]);

  const debouncedChainId = useDebounce(activeChainId, 100);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const chainId = debouncedChainId ? supportedChainId(debouncedChainId) ?? null : null;
    dispatch(updateChainId({ chainId }));
    dispatch(setSelectedNodeOperator(null));
  }, [dispatch, debouncedChainId]);

  return null;
}
