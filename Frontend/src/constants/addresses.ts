import { SupportedChainId } from './chains';

type AddressMap = { [chainId: number]: string };

const MAINNET_MULTICALL_ADDRESS = process.env.REACT_APP_MAINNET_MULTICALL_ADDRESS;
if (typeof MAINNET_MULTICALL_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_MAINNET_MULTICALL_ADDRESS must be a defined environment variable`);
}
const GOERLI_MULTICALL_ADDRESS = process.env.REACT_APP_GOERLI_MULTICALL_ADDRESS;
if (typeof GOERLI_MULTICALL_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_GOERLI_MULTICALL_ADDRESS must be a defined environment variable`);
}
const KALEIDO_MULTICALL_ADDRESS = process.env.REACT_APP_KALEIDO_MULTICALL_ADDRESS;
if (typeof KALEIDO_MULTICALL_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_KALEIDO_MULTICALL_ADDRESS must be a defined environment variable`);
}
const MAINNET_SWNFT_ADDRESS = process.env.REACT_APP_MAINNET_SWNFT_ADDRESS;
if (typeof MAINNET_SWNFT_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_MAINNET_SWNFT_ADDRESS must be a defined environment variable`);
}
const GOERLI_SWNFT_ADDRESS = process.env.REACT_APP_GOERLI_SWNFT_ADDRESS;
if (typeof GOERLI_SWNFT_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_GOERLI_SWNFT_ADDRESS must be a defined environment variable`);
}
const KALEIDO_SWNFT_ADDRESS = process.env.REACT_APP_KALEIDO_SWNFT_ADDRESS;
if (typeof KALEIDO_SWNFT_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_KALEIDO_SWNFT_ADDRESS must be a defined environment variable`);
}
const MAINNET_SWETH_ADDRESS = process.env.REACT_APP_MAINNET_SWETH_ADDRESS;
if (typeof MAINNET_SWETH_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_MAINNET_SWETH_ADDRESS must be a defined environment variable`);
}
const GOERLI_SWETH_ADDRESS = process.env.REACT_APP_GOERLI_SWETH_ADDRESS;
if (typeof GOERLI_SWETH_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_GOERLI_SWETH_ADDRESS must be a defined environment variable`);
}
const KALEIDO_SWETH_ADDRESS = process.env.REACT_APP_KALEIDO_SWETH_ADDRESS;
if (typeof KALEIDO_SWETH_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_KALEIDO_SWETH_ADDRESS must be a defined environment variable`);
}
const MAINNET_POAP_ADDRESS = process.env.REACT_APP_MAINNET_POAP_ADDRESS;
if (typeof MAINNET_POAP_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_MAINNET_POAP_ADDRESS must be a defined environment variable`);
}
const GOERLI_POAP_ADDRESS = process.env.REACT_APP_GOERLI_POAP_ADDRESS;
if (typeof GOERLI_POAP_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_GOERLI_POAP_ADDRESS must be a defined environment variable`);
}
const KALEIDO_POAP_ADDRESS = process.env.REACT_APP_KALEIDO_POAP_ADDRESS;
if (typeof KALEIDO_POAP_ADDRESS === 'undefined') {
  throw new Error(`REACT_APP_KALEIDO_POAP_ADDRESS must be a defined environment variable`);
}

// eslint-disable-next-line import/prefer-default-export
export const MULTICALL_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: MAINNET_MULTICALL_ADDRESS,
  [SupportedChainId.GOERLI]: GOERLI_MULTICALL_ADDRESS,
  [SupportedChainId.KALEIDO]: KALEIDO_MULTICALL_ADDRESS,
};
export const SWNFT_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: MAINNET_SWNFT_ADDRESS,
  [SupportedChainId.GOERLI]: GOERLI_SWNFT_ADDRESS,
  [SupportedChainId.KALEIDO]: KALEIDO_SWNFT_ADDRESS,
};
export const SWETH_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: MAINNET_SWETH_ADDRESS,
  [SupportedChainId.GOERLI]: GOERLI_SWETH_ADDRESS,
  [SupportedChainId.KALEIDO]: KALEIDO_SWETH_ADDRESS,
};
export const POAP_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: MAINNET_POAP_ADDRESS,
  [SupportedChainId.GOERLI]: GOERLI_POAP_ADDRESS,
  [SupportedChainId.KALEIDO]: KALEIDO_POAP_ADDRESS,
};
