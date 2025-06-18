import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModalState {
  showFreeDeliveryModal: boolean;
  freeDelivery: {
    count: number;
    date: string;
  } | null;
}

const initialState: ModalState = {
  showFreeDeliveryModal: false,
  freeDelivery: null,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showFreeDeliveryModal(
      state,
      action: PayloadAction<{ count: number; date: string }>,
    ) {
      state.showFreeDeliveryModal = true;
      state.freeDelivery  = action.payload;
    },
    closeFreeDeliveryModal(state) {
      state.showFreeDeliveryModal = false;
      state.freeDelivery  = null;
    },
  },
});

export const { showFreeDeliveryModal, closeFreeDeliveryModal } =
  modalSlice.actions;
export default modalSlice.reducer;
