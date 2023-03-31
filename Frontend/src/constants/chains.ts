// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const KALEIDO_CHAIN_ID = process.env.REACT_APP_KALEIDO_CHAIN_ID;
if (typeof KALEIDO_CHAIN_ID === 'undefined') {
  throw new Error(`REACT_APP_KALEIDO_CHAIN_ID must be a defined environment variable`);
}

/**
 * List of all the networks supported by the Uniswap Interface
 */
export enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
  KALEIDO = Number(KALEIDO_CHAIN_ID),
}

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.MAINNET]: 'mainnet',
  [SupportedChainId.GOERLI]: 'goerli',
  [SupportedChainId.KALEIDO]: 'kaleido',
};

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id) => typeof id === 'number'
) as SupportedChainId[];

export const SUPPORTED_GAS_ESTIMATE_CHAIN_IDS = [SupportedChainId.MAINNET];

/**
 * All the chain IDs that are running the Ethereum protocol.
 */
export const L1_CHAIN_IDS = [SupportedChainId.MAINNET, SupportedChainId.GOERLI, SupportedChainId.KALEIDO] as const;

export type SupportedL1ChainId = typeof L1_CHAIN_IDS[number];
