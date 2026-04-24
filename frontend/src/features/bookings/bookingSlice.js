import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axiosConfig';

export const createBooking = createAsyncThunk('bookings/create', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post('/bookings', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Booking failed');
  }
});

export const fetchMyBookings = createAsyncThunk('bookings/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/bookings/my');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchVendorBookings = createAsyncThunk('bookings/fetchVendor', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/bookings/vendor');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateBookingStatus = createAsyncThunk('bookings/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`/bookings/${id}/status`, { status });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const cancelBooking = createAsyncThunk('bookings/cancel', async (id, { rejectWithValue }) => {
  try {
    await axios.put(`/bookings/${id}/cancel`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: { myBookings: [], vendorBookings: [], currentBooking: null, loading: false, error: null },
  reducers: { clearBookingError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createBooking.fulfilled, (s, a) => { s.loading = false; s.currentBooking = a.payload; })
      .addCase(createBooking.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMyBookings.fulfilled, (s, a) => { s.myBookings = a.payload; })
      .addCase(fetchVendorBookings.fulfilled, (s, a) => { s.vendorBookings = a.payload; })
      .addCase(cancelBooking.fulfilled, (s, a) => { s.myBookings = s.myBookings.map((b) => b._id === a.payload ? { ...b, status: 'cancelled' } : b); })
      .addCase(updateBookingStatus.fulfilled, (s, a) => { s.vendorBookings = s.vendorBookings.map((b) => b._id === a.payload._id ? a.payload : b); });
  },
});

export const { clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;
