import { useEffect } from 'react';

import { styled } from '@mui/material';
import { useWeb3React } from 'web3-react-core';

import { network } from '../../connectors';
import { NetworkContextName } from '../../constants/misc';
import { useEagerConnect, useInactiveListener } from '../../hooks/web3';

const MessageWrapper = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '20rem',
}));

const Message = styled('h2')(({ theme }) => ({
  color: `${theme.palette.error}`,
}));

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Web3ReactManager({ children }: { children: JSX.Element }) {
  const { active } = useWeb3React();
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NetworkContextName);

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(network);
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active]);

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (triedEager && !active && networkError) {
    return (
      <MessageWrapper>
        <Message>
          <span>
            {' '}
            Oops! An unknown error occurred. Please refresh the page, or visit from another browser or device.
          </span>
        </Message>
      </MessageWrapper>
    );
  }

  return children;
}
