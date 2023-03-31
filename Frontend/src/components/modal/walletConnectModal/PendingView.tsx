import { FC } from 'react';

import { Box, BoxProps, CircularProgress, darken, styled } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AbstractConnector } from 'web3-react-abstract-connector';

import { injected } from '../../../connectors';
import { SUPPORTED_WALLETS } from '../../../constants/wallet';
import { Option } from './Option';

const PendingSection = styled('div')`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  & > * {
    width: 100%;
  }
`;

type LoadingMessageProps = BoxProps & {
  error?: boolean;
};
const LoadingMessage = styled(({ error, ...props }: LoadingMessageProps) => <Box {...props} />)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 12px;
  margin-bottom: 20px;
  color: ${({ theme, error }) => (error ? theme.palette.error.main : 'inherit')};
  border: 1px solid ${({ theme, error }) => (error ? theme.palette.error.main : '#C3C5CB')};

  & > * {
    padding: 1rem;
  }
`;

const ErrorGroup = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const ErrorButton = styled('div')`
  border-radius: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.palette.common.black};
  background-color: '#888D9B';
  margin-left: 1rem;
  padding: 0.5rem;
  font-weight: 600;
  user-select: none;

  &:hover {
    cursor: pointer;
    background-color: ${() => darken('#C3C5CB', 0.1)};
  }
`;

const LoadingWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
`;

type PendingViewProps = {
  connector?: AbstractConnector;
  error?: boolean;
  setPendingError: (error: boolean) => void;
  tryActivation: (connector: AbstractConnector) => void;
};

const PendingView: FC<PendingViewProps> = ({ connector, error, setPendingError, tryActivation }) => {
  const isMetamask = window?.ethereum?.isMetaMask;
  return (
    <PendingSection>
      <LoadingMessage error={error}>
        <LoadingWrapper>
          {error ? (
            <ErrorGroup>
              <div>Error connecting</div>
              <ErrorButton
                onClick={() => {
                  setPendingError(false);
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  connector && tryActivation(connector);
                }}
              >
                Try Again
              </ErrorButton>
            </ErrorGroup>
          ) : (
            <>
              <CircularProgress size={20} sx={{ marginRight: '10px' }} />
              Initializing...
            </>
          )}
        </LoadingWrapper>
      </LoadingMessage>
      {Object.keys(SUPPORTED_WALLETS).map((key) => {
        const option = SUPPORTED_WALLETS[key];
        if (option.connector === connector) {
          if (option.connector === injected) {
            if (isMetamask && option.name !== 'MetaMask') {
              return null;
            }
            if (!isMetamask && option.name === 'MetaMask') {
              return null;
            }
          }
          return (
            <Option
              clickable={false}
              color={option.color}
              header={option.name}
              icon={option.iconURL}
              id={`connect-${key}`}
              key={key}
              // onClick={clickHandler}
              subheader={option.description}
            />
          );
        }
        return null;
      })}
    </PendingSection>
  );
};

export default PendingView;
