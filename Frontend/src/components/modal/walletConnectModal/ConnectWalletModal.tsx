/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { ArrowBack } from '@mui/icons-material';
import { Box, styled, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { AbstractConnector } from 'web3-react-abstract-connector';
import { UnsupportedChainIdError, useWeb3React } from 'web3-react-core';
import { InjectedConnector } from 'web3-react-injected-connector';
import { WalletConnectConnector } from 'web3-react-walletconnect-connector';

import MetamaskIcon from '../../../assets/images/metamask.png';
import { fortmatic, injected, portis } from '../../../connectors';
import { OVERLAY_READY } from '../../../connectors/Fortmatic';
import { SUPPORTED_WALLETS } from '../../../constants/wallet';
import { PROTOCOL_DISCLAIMER, TERMS_AND_SERVICES } from '../../../constants/websiteUrls';
import usePrevious from '../../../hooks/usePrevious';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setIsWalletModalOpen } from '../../../state/modal/modalSlice';
import { Modal } from '../../../theme/uiComponents';
import { displayErrorMessage } from '../../../utils/errors';
import { isMobile } from '../../../utils/userAgent';
import AccountDetails from '../../AccountDetails';
import { Option } from './Option';
import PendingView from './PendingView';

const MuiModal = styled(Modal)({
  '& .MuiDialogTitle-root': {
    paddingInline: '30px',
    '& .close-btn': {
      right: '15px',
    },
  },
  '& .MuiDialogContent-root': {
    paddingInline: '20px',
  },
});
const HoverText = styled('div')(() => ({
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    cursor: 'pointer',
  },
}));

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
};

const excludePaths = ['become-a-node-operator', 'register-with-ethdo', 'deposit-ethereum', 'node-operators'];

const ConnectWalletModal: FC = () => {
  // important that these are destructed from the account-specific web3-react context
  const dispatch = useAppDispatch();
  const { isWalletModalOpen } = useAppSelector((state) => state.modal);
  const { selectedNodeOperator } = useAppSelector((state) => state.nodeOperator);
  const { active, account, connector, activate, error } = useWeb3React();
  const { pathname } = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>();

  const [pendingError, setPendingError] = useState<boolean>();

  const previousAccount = usePrevious(account);

  const closeWalletModal = useCallback(() => dispatch(setIsWalletModalOpen(false)), [dispatch]);

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && pathname) {
      let shouldOpenNodeOperatorSelectionModal = true;
      if (pathname !== '/') {
        const firstPortionOfPath = pathname?.split('/')[1];
        shouldOpenNodeOperatorSelectionModal = excludePaths.indexOf(firstPortionOfPath) === -1;
      }
      if (account && selectedNodeOperator === null && shouldOpenNodeOperatorSelectionModal) {
        closeWalletModal();
        dispatch(setIsWalletModalOpen(true));
      }
    }
  }, [account, closeWalletModal, dispatch, pathname, previousAccount, selectedNodeOperator]);

  // always reset to account view
  useEffect(() => {
    if (isWalletModalOpen) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [isWalletModalOpen]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (
      isWalletModalOpen &&
      ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))
    ) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [active, error, connector, activePrevious, connectorPrevious, isWalletModalOpen]);

  const activateInjectedProvider = (_connector: AbstractConnector | undefined) => {
    const { ethereum } = window;
    if (!ethereum?.providers) {
      return;
    }

    let provider;

    if (_connector instanceof InjectedConnector) {
      provider = ethereum.providers.find((_provider) => _provider.isMetaMask && !_provider.isBraveWallet);
    }

    if (provider && ethereum) {
      ethereum?.setSelectedProvider(provider);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const tryActivation = async (connector: AbstractConnector | undefined) => {
    activateInjectedProvider(connector);

    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        localStorage.setItem('CONNECTOR_ID', key);
        return SUPPORTED_WALLETS[key].name;
      }
      return true;
    });
    setPendingWallet(connector); // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector) {
      // eslint-disable-next-line no-param-reassign
      connector.walletConnectProvider = undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    connector &&
      // eslint-disable-next-line @typescript-eslint/no-shadow
      activate(connector, undefined, true).catch((err) => {
        if (err instanceof UnsupportedChainIdError) {
          activate(connector); // a little janky...can't use setError because the connector isn't set
          displayErrorMessage(enqueueSnackbar, err);
        } else {
          setPendingError(true);
        }
      });
  };

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      closeWalletModal();
    });
  }, [closeWalletModal]);

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask;
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key];
      // check for mobile options
      if (isMobile) {
        // disable portis on mobile for now
        if (option.connector === portis) {
          return null;
        }

        if (((!window.web3 && !window.ethereum) || isMobile) && option.mobile) {
          return (
            <Option
              active={option.connector && option.connector === connector}
              color={option.color}
              header={option.name}
              icon={option.iconURL}
              id={`connect-${key}`}
              key={key}
              link={option.href}
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                option.connector !== connector && !option.href && tryActivation(option.connector);
              }}
              subheader={null}
            />
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                color="#E8831D"
                header="Install Metamask"
                icon={MetamaskIcon}
                id={`connect-${key}`}
                key={key}
                link="https://metamask.io/"
                subheader={null}
                target="_blank"
              />
            );
          }
          return null; // dont want to return install twice
        }
        // don't return metamask if injected provider isn't metamask
        if (option.name === 'MetaMask' && !isMetamask) {
          return null;
        }
        // likewise for generic
        if (option.name === 'Injected' && isMetamask) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            active={option.connector === connector}
            color={option.color}
            header={option.name}
            icon={option.iconURL}
            id={`connect-${key}`}
            key={key}
            link={option.href}
            onClick={() => {
              if (option.connector === connector) {
                setWalletView(WALLET_VIEWS.ACCOUNT);
              } else if (!option.href) {
                tryActivation(option.connector);
              }
            }} // use option.descriptio to bring back multi-line
            subheader={null}
          />
        )
      );
    });
  }

  function getModalContent() {
    if (error) {
      return (
        <MuiModal
          onClose={() => dispatch(setIsWalletModalOpen(false))}
          open={isWalletModalOpen}
          title={error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error connecting'}
        >
          {error instanceof UnsupportedChainIdError ? (
            <Typography component="h5">
              Please connect to a supported network in the dropdown menu or in your wallet.
            </Typography>
          ) : (
            <span>Error connecting. Try refreshing the page.</span>
          )}
        </MuiModal>
      );
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          // toggleWalletModal={toggleWalletModal}
          // pendingTransactions={pendingTransactions}
          // confirmedTransactions={confirmedTransactions}
          // ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      );
    }
    return (
      <MuiModal
        icon={
          walletView !== WALLET_VIEWS.ACCOUNT ? (
            <HoverText
              onClick={() => {
                setPendingError(false);
                setWalletView(WALLET_VIEWS.ACCOUNT);
              }}
            >
              <ArrowBack />
            </HoverText>
          ) : null
        }
        onClose={() => dispatch(setIsWalletModalOpen(false))}
        open={isWalletModalOpen}
        title={walletView !== WALLET_VIEWS.ACCOUNT ? '' : 'Connect a wallet'}
      >
        <Box
          sx={{
            padding: '14px 20px',
            borderRadius: '15px',
            background: (theme) =>
              theme.palette.mode === 'light' ? theme.palette.grey['300'] : theme.palette.grey['200'],
            marginBottom: '20px',
            fontWeight: 400,
            fontSize: (theme) => theme.typography.body1.fontSize,
            '& a': {
              color: 'inherit',
              fontWeight: 600,
              textDecoration: 'underline',
            },
          }}
        >
          By connecting a wallet, you agree to Swell Network’s{' '}
          <a href={TERMS_AND_SERVICES} rel="noopener noreferrer" target="_blank">
            Terms of Service
          </a>{' '}
          and acknowledge that you have read and understand the Swell Network{' '}
          <a href={PROTOCOL_DISCLAIMER} rel="noopener noreferrer" target="_blank">
            Protocol Disclaimer
          </a>
        </Box>
        {walletView === WALLET_VIEWS.PENDING ? (
          <PendingView
            connector={pendingWallet}
            error={pendingError}
            setPendingError={setPendingError}
            tryActivation={tryActivation}
          />
        ) : (
          getOptions()
        )}
      </MuiModal>
    );
  }

  return getModalContent();
};

export default ConnectWalletModal;
