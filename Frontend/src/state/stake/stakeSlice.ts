import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum StakingPage {
  STAKE,
  DEPOSIT_ETHEREUM,
}

export interface IReferralCode {
  wallet: string;
  referralCode: string;
}

interface StakeState {
  amount: number | undefined;
  page: StakingPage | undefined;
}

const initialState: StakeState = {
  amount: undefined,
  page: undefined,
};

export const stakeSlice = createSlice({
  name: 'stake',
  initialState,
  reducers: {
    setStakeAmount: (state, action: PayloadAction<{ amount: number; page: StakingPage }>) => {
      state.amount = action.payload.amount;
      state.page = action.payload.page;
    },
  },
});

export const { setStakeAmount } = stakeSlice.actions;
export default stakeSlice.reducer;
