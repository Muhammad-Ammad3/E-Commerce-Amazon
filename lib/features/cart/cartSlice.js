// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import axios from "axios";

// // 1. Fetch Cart
// export const fetchCart = createAsyncThunk(
//   "cart/fetchCart",
//   async ({ getToken }, thunkAPI) => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("/api/cart", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data || "Error fetching cart",
//       );
//     }
//   },
// );

// // 2. Upload Cart (Debouncing handle karne ke liye isse seedha call karein)
// export const uploadCart = createAsyncThunk(
//   "cart/uploadCart",
//   async ({ getToken }, thunkAPI) => {
//     try {
//       const { cartItems } = thunkAPI.getState().cart;
//       const token = await getToken();
//       const response = await axios.post(
//         "/api/cart",
//         { cart: cartItems },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data || "Error uploading cart",
//       );
//     }
//   },
// );

// const cartSlice = createSlice({
//   name: "cart",
//   initialState: {
//     total: 0,
//     cartItems: {},
//     status: "idle", // loading status ke liye
//   },
//   reducers: {
//     addToCart: (state, action) => {
//       const { productId } = action.payload;
//       if (state.cartItems[productId]) {
//         state.cartItems[productId]++;
//       } else {
//         state.cartItems[productId] = 1;
//       }
//       state.total += 1;
//     },
//     removeFromCart: (state, action) => {
//       const { productId } = action.payload;
//       if (state.cartItems[productId] > 0) {
//         state.cartItems[productId]--;
//         state.total -= 1;
//         if (state.cartItems[productId] === 0) {
//           delete state.cartItems[productId];
//         }
//       }
//     },
//     deleteItemFromCart: (state, action) => {
//       const { productId } = action.payload;
//       const quantity = state.cartItems[productId] || 0;
//       state.total -= quantity;
//       delete state.cartItems[productId];
//     },
//     clearCart: (state) => {
//       state.cartItems = {};
//       state.total = 0;
//     },
//   },
//   // 's' lagana zaroori hai
//   extraReducers: (builder) => {
//     // 'fulfilled' ki spelling sahi ki
//     builder.addCase(fetchCart.fulfilled, (state, action) => {
//       state.cartItems = action.payload.cart || {};
//       // total calculation
//       state.total = Object.values(state.cartItems).reduce(
//         (acc, qty) => acc + qty,
//         0,
//       );
//     });
//   },
// });

// export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } =
//   cartSlice.actions;

// export default cartSlice.reducer;


import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// 1. Fetch Cart
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
  }
);

// 2. Upload Cart
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
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error uploading cart",
      );
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    total: 0,
    cartItems: {}, // Yeh Object hi rehna chahiye
    status: "idle",
  },
  reducers: {
    addToCart: (state, action) => {
      const { productId } = action.payload;
      if (!state.cartItems) state.cartItems = {}; // Safety check

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

      // Masle ki jad yahan thi: Agar data array hai toh use object mein convert karein
      if (Array.isArray(incomingCart)) {
        const transformedCart = {};
        incomingCart.forEach((item) => {
          // Check karein ke item mein productId aur quantity hai
          const id = item.productId || item._id; 
          transformedCart[id] = item.quantity || 1;
        });
        state.cartItems = transformedCart;
      } else {
        state.cartItems = incomingCart || {};
      }

      // Total calculate karein safety ke saath
      state.total = Object.values(state.cartItems).reduce(
        (acc, qty) => acc + (Number(qty) || 0),
        0
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