import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
  profile: any;
}

const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

const initialState: AuthState = {
  isAuthenticated: !!token,
  token: token,
  loading: false,
  error: null,
  profile: user ? JSON.parse(user) : null,
};


export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<string>) {
      state.isAuthenticated = true;
      state.token = action.payload;
      state.loading = false;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.profile = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    fetchProfileStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      state.profile = action.payload;
    },
    fetchProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    changePasswordStart(state) {
      state.loading = true;
      state.error = null;
    },
    changePasswordSuccess(state, action: PayloadAction<string>) {
      state.isAuthenticated = true;
      state.token = action.payload;
      state.loading = false;
    },
    changePasswordFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fileUploadStart(state) {
      state.loading = true;
      state.error = null;
    },
    fileUploadSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.profile = action.payload;
    },
    fileUploadFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, fetchProfileStart, fetchProfileSuccess, fetchProfileFailure, changePasswordStart, changePasswordSuccess, changePasswordFailure, fileUploadStart, fileUploadSuccess, fileUploadFailure } = authSlice.actions;
