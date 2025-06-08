import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModalState {
  showFreeDeliveryModal: boolean;
  freeDeliveryCount: number | null;
}

const initialState: ModalState = {
  showFreeDeliveryModal: false,
  freeDeliveryCount: null,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showFreeDeliveryModal(state, action: PayloadAction<number>) {
      console.log("my actions:", action);

      state.showFreeDeliveryModal = true;
      state.freeDeliveryCount = action.payload;
      // state.freeDeliveryCount = 2;
    },
    closeFreeDeliveryModal(state) {
      state.showFreeDeliveryModal = false;
      state.freeDeliveryCount = null;
    },
  },
});

export const { showFreeDeliveryModal, closeFreeDeliveryModal } =
  modalSlice.actions;
export default modalSlice.reducer;
