import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: {
  currentStep: number;
  depositDataLength: number;
} = {
  currentStep: 0,
  depositDataLength: 16,
};

export const formStepperSlice = createSlice({
  name: 'formStepper',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setDepositDataLength: (state, action: PayloadAction<number>) => {
      state.depositDataLength = action.payload;
    },
  },
});

export const { setCurrentStep, setDepositDataLength } = formStepperSlice.actions;

export default formStepperSlice.reducer;
