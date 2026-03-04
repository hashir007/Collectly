import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    progress: 0
};

const loaderSlice = createSlice({
    name: "loader",
    initialState,
    reducers: {
        setProgress: (state, action) => {
            return { progress: action.payload };
        }
    }
});


const { reducer,actions } = loaderSlice;
export const { setProgress } = actions;
export default reducer;