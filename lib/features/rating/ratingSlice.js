// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
// import axios from 'axios';


// export const fetchUserRatings = createAsyncThunk("rating/fetchUserRatings", async ({getToken}, thunkAPI) => {
//     try {
//         const token = await getToken();
//         const {data} = await axios.get('/api/rating', {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return data ? data.ratings : [];
//     } catch (error) {
//        return thunkAPI.rejectWithValue(
//   error?.response?.data || { message: error.message }
// );
//     }
// })


// const ratingSlice = createSlice({
//     name: 'rating',
//     initialState: {
//         ratings: [],
//         loading: false,
//   error: null,
//     },
//     reducers: {
//         addRating: (state, action) => {
//             state.ratings.push(action.payload)
//         },
//     },
//     extraReducers: (builder) => {
//         builder.addCase(fetchUserRatings.fulfilled, (state, action) => {
//             state.ratings = action.payload;
//         })
//     }
// })

// export const { addRating } = ratingSlice.actions

// export default ratingSlice.reducer


import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchUserRatings = createAsyncThunk(
  "rating/fetchUserRatings",
  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/rating", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data?.ratings || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || {
          message: error.message,
        }
      );
    }
  }
);

const ratingSlice = createSlice({
  name: "rating",

  initialState: {
    ratings: [],
    loading: false,
    error: null,
  },

  reducers: {
    addRating: (state, action) => {
      const exists = state.ratings.find(
        (item) => item.id === action.payload.id
      );

      if (!exists) {
        state.ratings.push(action.payload);
      }
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchUserRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUserRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.ratings = action.payload;
      })

      .addCase(fetchUserRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addRating } = ratingSlice.actions;

export default ratingSlice.reducer;