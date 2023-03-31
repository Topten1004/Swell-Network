import { createSlice } from '@reduxjs/toolkit';

export interface ApplicationState {
  readonly chainId: number | null;
}

const initialState: ApplicationState = {
  chainId: null,
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    updateChainId(state, action) {
      const { chainId } = action.payload;
      state.chainId = chainId;
    },
  },
});

export const { updateChainId } = applicationSlice.actions;
export default applicationSlice.reducer;
