import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axiosConfig';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`/products?${query}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/products/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Product not found');
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/products/featured');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMyProducts = createAsyncThunk('products/myProducts', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/products/my');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createProduct = createAsyncThunk('products/create', async (formData, { rejectWithValue }) => {
  try {
    const res = await axios.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create product');
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [], featured: [], myProducts: [], selectedProduct: null,
    loading: false, error: null, page: 1, pages: 1, total: 0,
  },
  reducers: { clearProduct: (state) => { state.selectedProduct = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.products = a.payload.products; s.page = a.payload.page; s.pages = a.payload.pages; s.total = a.payload.total; })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProductById.pending, (s) => { s.loading = true; })
      .addCase(fetchProductById.fulfilled, (s, a) => { s.loading = false; s.selectedProduct = a.payload; })
      .addCase(fetchProductById.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchFeaturedProducts.fulfilled, (s, a) => { s.featured = a.payload; })
      .addCase(fetchMyProducts.fulfilled, (s, a) => { s.myProducts = a.payload; })
      .addCase(createProduct.fulfilled, (s, a) => { s.myProducts.unshift(a.payload); })
      .addCase(deleteProduct.fulfilled, (s, a) => { s.myProducts = s.myProducts.filter((p) => p._id !== a.payload); });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;
