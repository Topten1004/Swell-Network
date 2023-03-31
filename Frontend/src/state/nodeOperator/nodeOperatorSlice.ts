import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { INodeOperator } from './NodeOperator.interface';

const initialState: {
  nodeOperatorInfoToDisplay: INodeOperator | null;
  selectedNodeOperator: INodeOperator | null;
} = {
  nodeOperatorInfoToDisplay: null,
  selectedNodeOperator: null,
};

export const nodeOperatorSlice = createSlice({
  name: 'nodeOperator',
  initialState,
  reducers: {
    setNodeOperatorInfoToDisplay: (state, action: PayloadAction<INodeOperator>) => {
      state.nodeOperatorInfoToDisplay = action.payload;
    },
    setSelectedNodeOperator: (state, action: PayloadAction<INodeOperator | null>) => {
      state.selectedNodeOperator = action.payload;
    },
  },
});

export const { setNodeOperatorInfoToDisplay, setSelectedNodeOperator } = nodeOperatorSlice.actions;

export default nodeOperatorSlice.reducer;
