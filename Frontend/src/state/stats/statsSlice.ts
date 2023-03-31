import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StatsState {
  APR: string | undefined;
  GetAPRError: boolean;
  loadingAPR: boolean;
}

const initialState: StatsState = {
  APR: '',
  GetAPRError: false,
  loadingAPR: false,
};

export const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setAPRStats: (state, action: PayloadAction<string>) => {
      state.APR = action.payload;
    },
    setGetAPRError: (state, action: PayloadAction<boolean>) => {
      state.GetAPRError = action.payload;
    },
    setLoadingAPR: (state, action: PayloadAction<boolean>) => {
      state.loadingAPR = action.payload;
    },
  },
});

export const { setAPRStats, setGetAPRError, setLoadingAPR } = statsSlice.actions;
export default statsSlice.reducer;
