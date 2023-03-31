/* eslint-disable react/no-unescaped-entities */
/* eslint-disable import/prefer-default-export */

import IzumiLogo from '../assets/images/izumi_logo.png';
import { SupportedChainId } from './chains';

export interface VaultInfo {
  logo?: string;
  name: string;
  type: string;
  website: string;
  content: any;
  contentMore: any;
}

const DEFAULT_VAULT_INFO: VaultInfo = {
  name: 'Swell Network',
  type: 'Swell vault',
  website: 'swellnetwork.io',
  content: (
    <span>
      This strategy utilizes underlying swETH in your swNFT to provide liquidity in the Swell Curve Vault. The Swell
      Curve Vault involves providing liquidity to the CUrve sweTH pool to receive pool trading fees in CRV.
    </span>
  ),
  contentMore: (
    <span>
      On top of this, liquidity providers will receive swDAO rewards proportional to provide liquidity. Throughout this
      process, the existing swETH staking rewards are retained to continuously benefit from ETH staking rewards
      Additional benefits include governance token ownership in Swell Network DAO with the swDAO liquidity mining
      incentive program.
    </span>
  ),
};

export const VAULT_INFO: {
  [chainId: number]: {
    [address: string]: VaultInfo;
  };
} = {
  [SupportedChainId.MAINNET]: {
    '0x09930deb4019b3f3de0f66704d6639bdd1ed7b75': DEFAULT_VAULT_INFO,
  },
  [SupportedChainId.GOERLI]: {
    '0xe748985dd6193d854650044ba24365df907bcfa1': DEFAULT_VAULT_INFO,
    '0x4142966b5c7cc59ed30cdae1641c43c0897a9d3a': DEFAULT_VAULT_INFO,
    '0x499420ae6e4d13d5f9a372c8499f0eb2dd4004fc': {
      logo: IzumiLogo,
      name: 'Izumi Finance',
      type: 'Izumi liquid box',
      website: 'izumi.finance',
      content: (
        <span>
          This vault strategy utilises Izumi's liquid box product and follows their{' '}
          <a
            href="https://docs.izumi.finance/product/liquidbox/liquidity-incentive-models#model-1-concentrated-liquidity-mining-model-with-fixed-reward-price-range-for-stablecoin-and-pegged"
            rel="noreferrer"
            target="_blank"
          >
            concentrated liquidity mining model
          </a>{' '}
          where swETH that is deposited in the vault is sent to a Uniswap V3 swETH/wETH liquidity pool (LP) and the
          returning LP tokens are held by Izumi's liquid box to accrue additional rewards.
        </span>
      ),
      contentMore: (
        <span>
          Upon withdrawal, the rewards and fees from the Uniswap V3 pool returned will be denominated in swETH and the
          rewards from the LP tokens held by Izumi's liquid box will be denominated in IZI and or SWELL tokens.
        </span>
      ),
    },
  },
  [SupportedChainId.KALEIDO]: {
    '0xf81058685270a4380e948d8ea4802536c4eb1349': DEFAULT_VAULT_INFO,
    '0xa04b836c4b0bc44be5d75dc62321ac28fe45c19b': DEFAULT_VAULT_INFO,
  },
};
