/// <reference types="react-scripts" />
declare module '@metamask/jazzicon' {
  export default function (diameter: number, seed: number): HTMLElement;
}

declare module 'fortmatic';

interface Window {
  // walletLinkExtension is injected by the Coinbase Wallet extension
  walletLinkExtension?: any;
  ethereum?: {
    // value that is populated and returns true by the Coinbase Wallet mobile dapp browser
    isCoinbaseWallet?: true;
    isMetaMask?: true;
    autoRefreshOnNetworkChange?: boolean;
    providers?: any[];
    setSelectedProvider: (provider: any) => Promise<void>;
  };
  web3?: Record<string, unknown>;
}
