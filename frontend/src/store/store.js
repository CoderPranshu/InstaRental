import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/products/productSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import themeReducer from '../features/theme/themeSlice';
import cartReducer from '../features/cart/cartSlice';

const persistConfig = { key: 'root', storage, whitelist: ['auth', 'cart'] };

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  bookings: bookingReducer,
  wishlist: wishlistReducer,
  theme: themeReducer,
  cart: cartReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] } }),
});

export const persistor = persistStore(store);
