// // import { addressDummyData } from '@/assets/assets'
// // import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
// // import axios from "axios"

// // export const fetchAddress = createAsyncThunk("address/fetchAddress",
// //     async ({getToken}, thunkAPI) => {
// //         try {
// //             const token = await getToken()
// //             const {data} = await axios.get("/api/address", {
// //         headers: { Authorization: `Bearer ${token}` },

// //             })
// //             return data ? data.addAddress : []
// //         } catch (error) {
// //       return thunkAPI.rejectWithValue(error.response?.data || "Error fetching address");

// //         }
// //     }
// // )

// // const addressSlice = createSlice({
// //     name: 'address',
// //     initialState: {
// //         list: [],
// //     },
// //     reducers: {
// //         addAddress: (state, action) => {
// //             state.list.push(action.payload)
// //         },
// //     },
// //     extraReducers: (builder) => {
// //         builder.addCase(fetchAddress.fulfilled, (state, action) => {
// //             state.list = action.payload
// //         })
// //     }
// // })

// // export const { addAddress } = addressSlice.actions

// // export default addressSlice.reducer

// import { addressDummyData } from "@/assets/assets";
// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import axios from "axios"; // 'form' ko 'from' kiya

// export const fetchAddress = createAsyncThunk(
//   "address/fetchAddress",
//   async ({ getToken }, thunkAPI) => {
//     try {
//       const token = await getToken();
//       // 'await' add kiya kyunki axios async hai
//       const { data } = await axios.get("/api/address", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // API structure ke mutabiq check karein (data.address ya data.addAddress)
//       return data.addresses || data.addresses || [];
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data || "Error fetching address",
//       );
//     }
//   },
// );

// const addressSlice = createSlice({
//   name: "address",
//   initialState: {
//     list: [],
//   },
//   reducers: {
//     addAddress: (state, action) => {
//       state.list.push(action.payload);
//     },
//   },
//   // 'extraReducres' ko 'extraReducers' kiya
//   extraReducers: (builder) => {
//     builder.addCase(fetchAddress.fulfilled, (state, action) => {
//       state.list = action.payload;
//     });
//     builder.addCase(fetchAddress.rejected, (state, action) => {
//       console.error("Address fetch failed:", action.payload);
//     });
//   },
// });

// export const { addAddress } = addressSlice.actions;

// export default addressSlice.reducer;



import { addressDummyData } from "@/assets/assets";
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

      // Yahan check karein ke data backend se kis key mein aa raha hai
      // Agar addresses hai toh woh lein, warna address, warna khali array
      return data.addresses || data.address || []; 
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error fetching address"
      );
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    list: [],
    loading: false, // loading state add karna behtar hai
    error: null
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
        // Safety check: ensure payload is always an array
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