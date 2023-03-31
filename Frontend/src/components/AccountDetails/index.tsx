import { FC, HTMLProps, useCallback } from 'react';
import { ExternalLink as LinkIcon } from 'react-feather';

import { Button, styled, Typography } from '@mui/material';
import { Connector } from '@web3-react/types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AbstractConnector } from 'web3-react-abstract-connector';
import { useWeb3React } from 'web3-react-core';

import { injected, portis, walletlink } from '../../connectors';
import { SUPPORTED_WALLETS } from '../../constants/wallet';
import useActiveWeb3React from '../../hooks/useActiveWeb3React';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { setIsWalletModalOpen } from '../../state/modal/modalSlice';
import { Modal } from '../../theme/uiComponents';
import LogoutIcon from '../../theme/uiComponents/icons/LogoutIcon';
import { shortenAddress } from '../../utils';
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink';
import StatusIcon from '../Identicon/StatusIcon';
import Copy from './Copy';

const WalletName = styled('div')(() => ({
  width: 'initial',
  fontSize: '0.825rem',
  fontWeight: 500,
}));

const InfoCard = styled('div')(({ theme }) => ({
  padding: '1rem',
  border: `1px solid ${theme.palette.grey.A200}`,
  borderRadius: '20px',
  position: 'relative',
  display: 'grid',
  gridRowGap: '12px',
  marginBottom: '20px',
}));

const AccountGroupingRow = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 400,
  div: {
    alignItems: 'center',
  },
}));

const AccountDividerRow = styled('div')(() => ({
  borderBottom: '1px solid #D4D4D4',
}));

const AccountSection = styled('div')(() => ({
  padding: '0rem 1rem',
}));

const YourAccount = styled('div')(() => ({
  h5: {
    margin: '0 0 1rem 0',
    fontWeight: 400,
  },
  h4: {
    margin: 0,
    fontWeight: 500,
  },
}));

const AccountControl = styled('div')(() => ({
  display: 'flex',
  minWidth: 0,
  width: '100%',

  fontWeight: 500,
  fontSize: '1.25rem',
  'a:hover': {
    textDecoration: 'underline',
  },
  p: {
    minWidth: 0,
    margin: '0px 0px 0px 10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  a: {
    marginLeft: '10px',
  },
}));

interface IWrappedStatusIcon {
  connector: AbstractConnector | Connector;
  displayShowPortisButton?: boolean;
}

export const WrappedStatusIcon: FC<IWrappedStatusIcon> = ({ connector, displayShowPortisButton = true }) => (
  <>
    <StatusIcon connector={connector} />
    {connector === portis && displayShowPortisButton && (
      <Button
        onClick={() => {
          portis.portis.showPortis();
        }}
        sx={{
          padding: '5px',
          fontSize: 12,
          fontWeight: 400,
        }}
        variant="outlined"
      >
        <span>Show Portis</span>
      </Button>
    )}
  </>
);

const StyledText = styled('p')(() => ({
  fontWeight: 400,
  lineHeight: 28 / 18,
  fontSize: 14,
  '& svg': {
    marginRight: '5px',
  },
}));

const LogoutButton = styled('button')(() => ({
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  color: '#00B0F0',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  '& svg': {
    marginRight: '5px',
  },
}));

export const ExternalLink: FC<Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & { href: string }> = ({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  ...rest
}) => (
  // eslint-disable-next-line react/jsx-max-props-per-line, react/jsx-props-no-spreading,jsx-a11y/anchor-has-content
  <a href={href} rel={rel} target={target} {...rest} />
);

interface AccountDetailsProps {
  ENSName?: string;
  openOptions: () => void;
}

const AccountDetails: FC<AccountDetailsProps> = ({ ENSName, openOptions }) => {
  const { chainId, account, connector } = useActiveWeb3React();
  const { deactivate } = useWeb3React();
  const { isWalletModalOpen } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();

  function formatConnectorName() {
    const { ethereum } = window;
    const isMetaMask = !!(ethereum && ethereum.isMetaMask);
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        (k) =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK'))
      )
      .map((k) => SUPPORTED_WALLETS[k].name)[0];
    return (
      <WalletName>
        <Typography component="h5" sx={{ 'div &': { marginBottom: '0px' } }}>
          Connected with {name}
        </Typography>
      </WalletName>
    );
  }

  const onLogout = useCallback(() => {
    localStorage.removeItem('CONNECTOR_ID');
    deactivate();
  }, [deactivate]);

  return (
    <>
      <Modal onClose={() => dispatch(setIsWalletModalOpen(false))} open={isWalletModalOpen} title="Account">
        <AccountSection>
          <YourAccount>
            <InfoCard>
              <AccountGroupingRow>
                {formatConnectorName()}
                <div style={{ display: 'flex' }}>
                  {connector !== injected && connector !== walletlink && (
                    <Button
                      onClick={() => {
                        (connector as any).close();
                      }}
                      style={{ fontSize: '.825rem', fontWeight: 400, marginRight: '8px', padding: 5 }}
                      variant="outlined"
                    >
                      <span>Disconnect</span>
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      openOptions();
                    }}
                    style={{ fontSize: '.825rem', fontWeight: 400, padding: 5 }}
                    variant="outlined"
                  >
                    <span>Change</span>
                  </Button>
                </div>
              </AccountGroupingRow>
              <AccountGroupingRow>
                <AccountControl>
                  {ENSName ? (
                    <>
                      {connector && <WrappedStatusIcon connector={connector} />}
                      <p> {ENSName}</p>
                    </>
                  ) : (
                    <>
                      {connector && <WrappedStatusIcon connector={connector} />}
                      <p> {account && shortenAddress(account)}</p>
                    </>
                  )}
                </AccountControl>
              </AccountGroupingRow>
              <AccountGroupingRow>
                {ENSName ? (
                  <>
                    <AccountControl>
                      {account && <Copy toCopy={account}>Copy Address</Copy>}
                      {chainId && account && (
                        <ExternalLink href={getExplorerLink(chainId, ENSName, ExplorerDataType.ADDRESS)}>
                          <StyledText>
                            <LinkIcon size={16} />
                            View on Explorer
                          </StyledText>
                        </ExternalLink>
                      )}
                    </AccountControl>
                  </>
                ) : (
                  <>
                    <AccountControl>
                      {account && <Copy toCopy={account}>Copy Address</Copy>}
                      {chainId && account && (
                        <ExternalLink href={getExplorerLink(chainId, account, ExplorerDataType.ADDRESS)}>
                          <StyledText>
                            <LinkIcon size={16} />
                            View on Explorer
                          </StyledText>
                        </ExternalLink>
                      )}
                    </AccountControl>
                  </>
                )}
              </AccountGroupingRow>
              <AccountDividerRow />
              <AccountGroupingRow>
                <LogoutButton onClick={onLogout}>
                  <LogoutIcon />
                  Disconnect
                </LogoutButton>
              </AccountGroupingRow>
            </InfoCard>
          </YourAccount>
        </AccountSection>
      </Modal>
    </>
  );
};
export default AccountDetails;
