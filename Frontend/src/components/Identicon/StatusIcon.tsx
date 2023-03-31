import { FC } from 'react';

import { styled } from '@mui/material';
import { Connector } from '@web3-react/types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AbstractConnector } from 'web3-react-abstract-connector';

import Identicon from '.';
import CoinbaseWalletIcon from '../../assets/images/coinbaseWalletIcon.svg';
import FortmaticIcon from '../../assets/images/fortmaticIcon.png';
import PortisIcon from '../../assets/images/portisIcon.png';
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg';
import { fortmatic, injected, portis, walletconnect, walletlink } from '../../connectors';

const AvtarIcon = styled('img')({
  width: 28,
  height: 28,
  borderRadius: '50%',
  objectFit: 'contain',
  overflow: 'hidden',
  marginRight: '8px',
  minWidth: 28,
});

const StatusIcon: FC<{ connector: AbstractConnector | Connector }> = ({ connector }) => {
  switch (connector) {
    case injected:
      return <Identicon />;
    case walletconnect:
      return <AvtarIcon alt="WalletConnect" src={WalletConnectIcon} />;
    case walletlink:
      return <AvtarIcon alt="Coinbase Wallet" src={CoinbaseWalletIcon} />;
    case fortmatic:
      return <AvtarIcon alt="Fortmatic" src={FortmaticIcon} />;
    case portis:
      return <AvtarIcon alt="Portis" src={PortisIcon} />;
    default:
      return null;
  }
};
export default StatusIcon;
