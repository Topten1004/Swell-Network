import { StrictMode } from 'react';
import { render } from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

import { createWeb3ReactRoot, Web3ReactProvider } from 'web3-react-core';

import App from './App';
import { NetworkContextName } from './constants/misc';
import reportWebVitals from './reportWebVitals';
import getLibrary from './utils/getLibrary';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

// eslint-disable-next-line no-extra-boolean-cast
if (!!(window as any).ethereum) {
  (window as any).ethereum.autoRefreshOnNetworkChange = false;
}

render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ProviderNetwork getLibrary={getLibrary}>
            {window.self === window.top ? <App /> : <></>}
          </Web3ProviderNetwork>
        </Web3ReactProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
