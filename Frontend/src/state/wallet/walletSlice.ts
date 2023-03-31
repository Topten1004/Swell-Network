import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletConnectState {
  accounts: string[];
  address: string;
  connected: boolean;
  fetching: boolean;
  ETH: number;
  swETH: number;
}

const initialState: WalletConnectState = {
  accounts: [],
  address: '',
  connected: false,
  fetching: false,
  ETH: 9.045,
  swETH: 1.01,
};

export const walletConnectSlice = createSlice({
  name: 'walletConnect',
  initialState,
  reducers: {
    reset: (state) => {
      state.accounts = [];
      state.address = '';
      state.connected = false;
    },
    onConnect: (state, action: PayloadAction<{ address: string; ETH: number; swETH: number }>) => {
      state.address = action.payload.address;
      state.ETH = action.payload.ETH;
      state.swETH = action.payload.swETH;
    },
  },
});

export const { onConnect, reset } = walletConnectSlice.actions;
export default walletConnectSlice.reducer;
