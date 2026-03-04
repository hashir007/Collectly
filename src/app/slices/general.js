import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    homePageView: 'POOL_VIEW'
};

const generalSlice = createSlice({
    name: "general",
    initialState,
    reducers: {
        setHomeView: (state, action) => {
            return { homePageView: action.payload };
        }
    }
});


const { reducer, actions } = generalSlice;
export const { setHomeView } = actions;
export default reducer;