import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axiosConfig';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/wishlist');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const res = await axios.post(`/wishlist/${productId}`);
    return { productId, added: res.data.added };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (s, a) => { s.items = a.payload; })
      .addCase(toggleWishlist.fulfilled, (s, a) => {
        if (!a.payload.added) {
          s.items = s.items.filter((i) => i._id !== a.payload.productId);
        }
      });
  },
});

export default wishlistSlice.reducer;
