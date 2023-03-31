import { Suspense } from 'react';
import { Provider } from 'react-redux';

import { ApolloClient, ApolloLink, ApolloProvider, from, InMemoryCache } from '@apollo/client';
import { CircularProgress } from '@mui/material';
import { createUploadLink } from 'apollo-upload-client';
import { useWeb3React } from 'web3-react-core';

import Web3ReactManager from './components/Web3ReactManager';
import { BlockUpdater } from './lib/hooks/useBlockNumber';
import { MulticallUpdater } from './lib/state/multicall';
import POAPDashboard from './pages/POAPDashboard';
import ApplicationUpdater from './state/application/updater';
import { store } from './state/store';
import { ThemeConfig } from './theme';
import { Snackbar } from './theme/uiComponents';

function Updaters() {
  return (
    <>
      <BlockUpdater />
      <MulticallUpdater />
      <ApplicationUpdater />
    </>
  );
}

function App(): JSX.Element {
  const { chainId, account } = useWeb3React();
  const uploadLink = createUploadLink({
    uri: process.env.REACT_APP_SWELL_GRAPHQL_URI,
    useGETForQueries: true,
  }) as any;

  const chainMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        chainId: chainId || null,
        account,
      },
    }));

    return forward(operation);
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: from([chainMiddleware, uploadLink]),
  });

  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <Updaters />
        <ThemeConfig>
          <Web3ReactManager>
            <Snackbar maxSnack={2}>
              <Suspense fallback={<CircularProgress sx={{ margin: '50px auto' }} />}>
                <POAPDashboard />
              </Suspense>
            </Snackbar>
          </Web3ReactManager>
        </ThemeConfig>
      </Provider>
    </ApolloProvider>
  );
}

export default App;
