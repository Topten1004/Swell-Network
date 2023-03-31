import { FC, Suspense } from 'react';
import { useLocation } from 'react-router';
import { Outlet } from 'react-router-dom';

import { Box, CircularProgress, styled } from '@mui/material';

import Faq from '../components/faq/Faq';
import Header from '../components/header';
import ConfirmStakeModal from '../components/modal/confirmStakeModal';
import DesktopOnlyActionModal from '../components/modal/desktopOnlyActionModal';
import DepositLiquidityTransactionModal from '../components/modal/liquidityTransactionModal/DepositLiquidityTransactionModal';
import WithdrawLiquidityTransactionModal from '../components/modal/liquidityTransactionModal/WithdrawLiquidityTransactionModal';
import NodeOperatorInfoModal from '../components/modal/nodeOperatorInfoModal';
import VaultTransactionModal from '../components/modal/vaultTransactionModal/VaultTransactionModal';
import ConnectWalletModal from '../components/modal/walletConnectModal/ConnectWalletModal';
import NodeOperatorModal from '../components/nodeOperators/NodeOperatorModal';
import Statistics from '../components/statistics/Statistics';
import { useAppSelector } from '../state/hooks';

const Row = styled(Box)(({ theme }) => ({
  display: 'flex',
  gridGap: 20,
  flexDirection: 'column-reverse',
  [theme.breakpoints.up('sm')]: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1fr 0.66fr',
  },
}));

const MainLayout: FC = () => {
  const location = useLocation();
  const pathNames = location.pathname.split('/');
  const {
    isWalletModalOpen,
    isNodeOperatorModalOpen,
    isNodeOperatorInfoModalOpen,
    isDepositLiquidityTransactionModalOpen,
    isWithdrawLiquidityTransactionModalOpen,
    isVaultTransactionModalOpen,
    isConfirmStakeModalOpen,
    isDesktopOnlyModalOpen,
  } = useAppSelector((state) => state.modal);
  const displayFaqAndStats =
    pathNames[pathNames.length - 1] === 'stake' ||
    pathNames[pathNames.length - 1] === '' ||
    pathNames[pathNames.length - 1] === 'vaults';

  return (
    <>
      <Header />
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', marginTop: '20%', marginLeft: '50%' }}>
            <CircularProgress />
          </Box>
        }
      >
        {isWalletModalOpen && <ConnectWalletModal />}
        {isNodeOperatorModalOpen && <NodeOperatorModal />}
        {isNodeOperatorInfoModalOpen && <NodeOperatorInfoModal />}
        {isDepositLiquidityTransactionModalOpen && <DepositLiquidityTransactionModal />}
        {isWithdrawLiquidityTransactionModalOpen && <WithdrawLiquidityTransactionModal />}
        {isVaultTransactionModalOpen && <VaultTransactionModal />}
        {isConfirmStakeModalOpen && <ConfirmStakeModal />}
        {isDesktopOnlyModalOpen && <DesktopOnlyActionModal />}

        <Box
          sx={{
            maxWidth: {
              xs: '100%',
              md: '728px',
              xl: '840px',
            },
            padding: ['10px 10px 80px', '20px'],
            margin: 'auto',
          }}
        >
          <Outlet />
          {displayFaqAndStats && (
            <Row>
              <Faq />
              <Statistics />
            </Row>
          )}
        </Box>
      </Suspense>
    </>
  );
};

export default MainLayout;
