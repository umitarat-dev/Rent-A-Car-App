import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
import axiosInstance from '../config/axiosConfig';

// Yardımcı fonksiyon: LocalStorage'dan güvenli veri çekme
const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Giriş Yapma (Login) Thunk
export const login = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
  try {
    // console.log("Giriş denemesi yapılana veri:", userData);
    const response = await axiosInstance.post('users/auth/login/', userData);
    // Backend'den CustomTokenSerializer sayesinde { key, user } formatında veri gelecek
    localStorage.setItem('token', response.data.key);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Giriş başarısız.');
  }
});

// Kayıt Olma (Register) Thunk
export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('users/register/', userData);
    // Backend RegisterAPI'den { token: "...", username: "...", email: "..." } vb. dönüyor    
    localStorage.setItem('token', response.data.token);
    // Kayıt sonrası kullanıcı bilgisini de saklayalım (Backend'in ne döndüğüne bağlı)
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Kayıt başarısız.');
  }
});

// googleLogin Thunk:
export const googleLogin = createAsyncThunk('auth/googleLogin', async (credential, { rejectWithValue }) => {
  try {
    // Backend'deki Google endpoint'in (Örn: users/auth/google/)
    const response = await axiosInstance.post('users/auth/google/', { access_token: credential });
    localStorage.setItem('token', response.data.key);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Google login başarısız.');
  }
});
// extraReducers kısmına registerUser.fulfilled gibi bir case eklemeyi unutma!


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    // user: JSON.parse(localStorage.getItem('user')) || null,
    user: getUserFromStorage(),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  },
  reducers: {
    // Logout işlemini doğrudan reducer içine aldık (Daha hızlı ve senkron)
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { 
        state.loading = true;
        state.error = null; 
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // CustomTokenSerializer'dan gelen user
        state.token = action.payload.key;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Kayıt başarılı olduğunda kullanıcıyı içeri alalım
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload;
        state.error = null;
      })
      // google account login başarılı olduğunda kullanıcıyı içeri alalım
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.key;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => { 
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;