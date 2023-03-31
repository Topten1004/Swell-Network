import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IRegisterWithEthdo {
  selectedPublicKey: string;
  isSubmissionComplete: boolean;
}

const initialState: IRegisterWithEthdo = { selectedPublicKey: '', isSubmissionComplete: false };

export const registerEthdoStepperSlice = createSlice({
  name: 'registerEthDo',
  initialState,
  reducers: {
    setSelectedPublicKey: (state, action: PayloadAction<string>) => {
      state.selectedPublicKey = action.payload;
    },
    setSubmissionStatus: (state, action: PayloadAction<boolean>) => {
      state.isSubmissionComplete = action.payload;
    },
  },
});

export const { setSelectedPublicKey, setSubmissionStatus } = registerEthdoStepperSlice.actions;

export default registerEthdoStepperSlice.reducer;
