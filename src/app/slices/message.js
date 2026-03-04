import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  message: "",
  type: ""
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessage: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    clearMessage: (state, action) => {
      state.message = "";
      state.type = "";
    }
  }
});


const { reducer, actions } = messageSlice;
export const { setMessage, clearMessage } = actions;
export default reducer;