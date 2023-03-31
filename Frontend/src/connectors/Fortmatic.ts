// eslint-disable-next-line import/no-extraneous-dependencies
import { FortmaticConnector as FortmaticConnectorCore } from 'web3-react-fortmatic-connector';

import { setIsNodeOperatorModalOpen } from '../state/modal/modalSlice';
import { store } from '../state/store';

export const OVERLAY_READY = 'OVERLAY_READY';

type FormaticSupportedChains = 1;

const CHAIN_ID_NETWORK_ARGUMENT: { readonly [chainId in FormaticSupportedChains]: string | undefined } = {
  1: undefined,
};

export class FortmaticConnector extends FortmaticConnectorCore {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async activate() {
    if (!this.fortmatic) {
      // eslint-disable-next-line import/no-extraneous-dependencies
      const { default: Fortmatic } = await import('fortmatic');
      const { apiKey, chainId } = this as any;
      if (chainId in CHAIN_ID_NETWORK_ARGUMENT) {
        this.fortmatic = new Fortmatic(apiKey, CHAIN_ID_NETWORK_ARGUMENT[chainId as FormaticSupportedChains]);
      } else {
        throw new Error(`Unsupported network ID: ${chainId}`);
      }
    }
    const provider = this.fortmatic.getProvider();
    const pollForOverlayReady = new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (provider.overlayReady) {
          clearInterval(interval);
          this.emit(OVERLAY_READY);
          resolve();
        }
      }, 200);
    });
    const [account] = await Promise.all([
      provider.enable().then((accounts: string[]) => accounts[0]),
      pollForOverlayReady,
    ]);
    store.dispatch(setIsNodeOperatorModalOpen(true));
    return { provider: this.fortmatic.getProvider(), chainId: (this as any).chainId, account };
  }
}
