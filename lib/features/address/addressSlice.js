import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAddress = createAsyncThunk(
  "address/fetchAddress",
  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/address", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data.addresses || data.address || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error fetching address",
      );
    }
  },
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    addAddress: (state, action) => {
      state.list.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Address fetch failed:", action.payload);
      });
  },
});

export const { addAddress } = addressSlice.actions;

export default addressSlice.reducer;
