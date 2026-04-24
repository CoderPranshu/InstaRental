import { createSlice } from '@reduxjs/toolkit';

const THEME_STORAGE_KEY = 'instarental-theme';

const getInitialMode = () => {
  if (typeof window === 'undefined') return 'light';

  const storedMode = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedMode === 'dark' || storedMode === 'light') {
    return storedMode;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState = {
  mode: getInitialMode(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, state.mode);
      }
    },
    setTheme: (state, action) => {
      const nextMode = action.payload === 'dark' ? 'dark' : 'light';
      state.mode = nextMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, nextMode);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
