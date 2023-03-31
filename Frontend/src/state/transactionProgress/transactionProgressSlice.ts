import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  isStakingInProgress: false,
  isDepositEthereumInProgress: false,
  isSwETHApprovalInProgress: false,
  isDepositInProgress: false,
  isWithdrawalInProgress: false,
  isEnterStrategyInProgress: false,
  isExitStrategyInProgress: false,
  isBatchApprovalInProgress: false,
  isBatchDepositInProgress: false,
  isBatchWithdrawalInProgress: false,
  isBatchEnterStrategyInProgress: false,
  isBatchExitStrategyInProgress: false,
};

export const transactionProgressSlice = createSlice({
  name: 'transactionProgress',
  initialState,
  reducers: {
    setIsStakingInProgress: (state, action: PayloadAction<boolean>) => {
      state.isStakingInProgress = action.payload;
    },
    setIsDepositEthereumInProgress: (state, action: PayloadAction<boolean>) => {
      state.isDepositEthereumInProgress = action.payload;
    },
    setIsSwETHApprovalInProgress: (state, action: PayloadAction<boolean>) => {
      state.isSwETHApprovalInProgress = action.payload;
    },
    setIsDepositInProgress: (state, action: PayloadAction<boolean>) => {
      state.isDepositInProgress = action.payload;
    },
    setIsWithdrawalInProgress: (state, action: PayloadAction<boolean>) => {
      state.isWithdrawalInProgress = action.payload;
    },
    setIsEnterStrategyInProgress: (state, action: PayloadAction<boolean>) => {
      state.isEnterStrategyInProgress = action.payload;
    },
    setIsExitStrategyInProgress: (state, action: PayloadAction<boolean>) => {
      state.isExitStrategyInProgress = action.payload;
    },
    setIsBatchApprovalInProgress: (state, action: PayloadAction<boolean>) => {
      state.isBatchApprovalInProgress = action.payload;
    },
    setIsBatchDepositInProgress: (state, action: PayloadAction<boolean>) => {
      state.isBatchDepositInProgress = action.payload;
    },
    setIsBatchWithdrawlInProgress: (state, action: PayloadAction<boolean>) => {
      state.isBatchWithdrawalInProgress = action.payload;
    },
    setIsBatchEnterStrategyInProgress: (state, action: PayloadAction<boolean>) => {
      state.isBatchEnterStrategyInProgress = action.payload;
    },
    setIsBatchExitStrategyInProgress: (state, action: PayloadAction<boolean>) => {
      state.isBatchExitStrategyInProgress = action.payload;
    },
  },
});

export const {
  setIsStakingInProgress,
  setIsDepositEthereumInProgress,
  setIsSwETHApprovalInProgress,
  setIsDepositInProgress,
  setIsWithdrawalInProgress,
  setIsEnterStrategyInProgress,
  setIsExitStrategyInProgress,
  setIsBatchApprovalInProgress,
  setIsBatchDepositInProgress,
  setIsBatchWithdrawlInProgress,
  setIsBatchEnterStrategyInProgress,
  setIsBatchExitStrategyInProgress,
} = transactionProgressSlice.actions;

export default transactionProgressSlice.reducer;
