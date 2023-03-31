import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import multicall from '../lib/state/multicall';
import formStepper from './formStepper/formStepperSlice';
import modal from './modal/modalSlice';
import nodeOperator from './nodeOperator/nodeOperatorSlice';
import registerEthDo from './registerNodeOperator/registerNodeOperatorSlice';
import stake from './stake/stakeSlice';
import stats from './stats/statsSlice';
import transactionProgress from './transactionProgress/transactionProgressSlice';
import walletConnect from './wallet/walletSlice';

export const store = configureStore({
  reducer: {
    walletConnect,
    modal,
    stake,
    multicall: multicall.reducer,
    nodeOperator,
    registerEthDo,
    formStepper,
    transactionProgress,
    stats,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
