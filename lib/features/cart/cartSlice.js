import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error fetching cart",
      );
    }
  },
);

export const uploadCart = createAsyncThunk(
  "cart/uploadCart",
  async ({ getToken }, thunkAPI) => {
    try {
      const { cartItems } = thunkAPI.getState().cart;
      const token = await getToken();
      const response = await axios.post(
        "/api/cart",
        { cart: cartItems },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error uploading cart",
      );
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    total: 0,
    cartItems: {},
    status: "idle",
  },
  reducers: {
    addToCart: (state, action) => {
      const { productId } = action.payload;
      if (!state.cartItems) state.cartItems = {};

      if (state.cartItems[productId]) {
        state.cartItems[productId]++;
      } else {
        state.cartItems[productId] = 1;
      }
      state.total += 1;
    },
    removeFromCart: (state, action) => {
      const { productId } = action.payload;
      if (state.cartItems[productId] > 0) {
        state.cartItems[productId]--;
        state.total -= 1;
        if (state.cartItems[productId] === 0) {
          delete state.cartItems[productId];
        }
      }
    },
    deleteItemFromCart: (state, action) => {
      const { productId } = action.payload;
      const quantity = state.cartItems[productId] || 0;
      state.total -= quantity;
      delete state.cartItems[productId];
    },
    clearCart: (state) => {
      state.cartItems = {};
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      const incomingCart = action.payload.cart;

      if (Array.isArray(incomingCart)) {
        const transformedCart = {};
        incomingCart.forEach((item) => {
          const id = item.productId || item._id;
          transformedCart[id] = item.quantity || 1;
        });
        state.cartItems = transformedCart;
      } else {
        state.cartItems = incomingCart || {};
      }

      state.total = Object.values(state.cartItems).reduce(
        (acc, qty) => acc + (Number(qty) || 0),
        0,
      );
      state.status = "succeeded";
    });

    builder.addCase(fetchCart.pending, (state) => {
      state.status = "loading";
    });

    builder.addCase(fetchCart.rejected, (state) => {
      state.status = "failed";
    });
  },
});

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } =
  cartSlice.actions;

export default cartSlice.reducer;
