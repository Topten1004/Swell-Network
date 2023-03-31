import React, { FC } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Components from './pages/Components';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NodeOperatorForm = React.lazy(() => import('./pages/BecomeANodeOperatorApplicationForm'));
const Stake = React.lazy(() => import('./pages/Stake'));
const Vault = React.lazy(() => import('./pages/Vault'));
const RegisterWithEthDo = React.lazy(() => import('./pages/RegisterWithEthDo'));
const NodeOperators = React.lazy(() => import('./pages/NodeOperators'));
const Faucet = React.lazy(() => import('./pages/Faucet'));
const Referral = React.lazy(() => import('./pages/Referral'));
const DepositEth = React.lazy(() => import('./pages/DepositEth'));
const PositionDetails = React.lazy(() => import('./pages/PositionDetails'));
const VaultDetail = React.lazy(() => import('./pages/VaultDetail'));
const ReferralLeaderboard = React.lazy(() => import('./pages/ReferralLeaderboard'));
//

// ----------------------------------------------------------------------

const Router: FC = () =>
  useRoutes([
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'stake', element: <Stake /> },
        { path: 'become-a-node-operator', element: <NodeOperatorForm /> },
        { path: 'register-with-ethdo/:nodeOperatorId', element: <RegisterWithEthDo /> },
        { path: 'vaults', element: <Vault /> },
        { path: 'node-operators', element: <NodeOperators /> },
        { path: 'kaleido-faucet', element: <Faucet network="Kaleido" /> },
        { path: 'goerli-faucet', element: <Faucet network="Goerli" /> },
        { path: 'referral', element: <Referral /> },
        { path: 'deposit-ethereum/:nodeOperatorId', element: <DepositEth /> },
        { path: 'vault-detail/:index', element: <VaultDetail /> },
        {
          path: '/position/:id',
          element: <PositionDetails />,
        },
        { path: 'referral-leaderboard', element: <ReferralLeaderboard /> },
      ],
    },

    {
      path: '/components',
      element: <MainLayout />,
      children: [{ index: true, element: <Components /> }],
    },
    { path: '*', element: <Navigate replace to="/" /> },
  ]);

export default Router;
