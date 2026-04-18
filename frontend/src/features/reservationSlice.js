import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../config/axiosConfig';

// 1. 🚀 Rezervasyon Oluşturma Thunk - ASYNC THUNK: Backend'den rezervasyonları çeken asenkron fonksiyon
export const createReservation = createAsyncThunk(
  'reservation/create', 
  async (reservationData, { rejectWithValue }) => {
    try {
      // reservationData: { car: id, start_date: '...', end_date: '...' } formatında gelecek
      const response = await axiosInstance.post('/api/reservation/', reservationData);
      return response.data;
    } catch (error) {
      // 🎯 İpucu: error.response?.data şeklinde kullanmak, 
      // internet kesilmesi gibi durumlarda uygulamanın çökmesini engeller.
      // Backend'den gelen spesifik hata mesajlarını yakalar (Örn: Çakışma hatası)
      return rejectWithValue(error.response?.data || 'Rezervasyon oluşturulamadı');
    }
  }
);

// 🚀 2. Kullanıcı Rezervasyonlarını Çekme (GET)
export const fetchUserReservations = createAsyncThunk(
  'reservation/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Backend'deki get_queryset mantığın sayesinde sadece giriş yapanın verileri gelir
      const response = await axiosInstance.get('/api/reservation/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Rezervasyonlar çekilemedi');
    }
  }
);

// 🎯 YENİ: 3. Rezervasyon İptal Etme (DELETE)
export const deleteReservation = createAsyncThunk(
  'reservation/delete',
  async (id, { rejectWithValue }) => {
    try {
      // Backend'deki endpoint'ine göre /api/reservation/id/ şeklinde istek atar
      await axiosInstance.delete(`/api/reservation/${id}/`);
      return id; // Silinen ID'yi dönüyoruz ki listeden çıkaralım
    } catch (error) {
      return rejectWithValue(error.response?.data || 'İptal işlemi başarısız oldu.');
    }
  }
);

// 🚀 4. SLICE: Verinin state içindeki yönetimi
const reservationSlice = createSlice({
  name: 'reservation',
  initialState: {
    items: [], // Kullanıcının tüm rezervasyonları
    current: null, // Şu anki rezervasyon bilgisi (varsa)
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // İleride rezervasyon iptali veya güncelleme gibi işlemler eklenebilir
    clearReservationStatus: (state) => {
      state.current = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
        // Create Reservation Cases
      .addCase(createReservation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload; // Backend'den gelen rezervasyon bilgisi
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.status = 'failed';
        // Hata mesajı objeyse (ValidationError), mesajı string'e çevirelim
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : Object.values(action.payload)[0]; // Backend'den gelen hata mesajı
      })
      // Fetch Reservations Cases
      .addCase(fetchUserReservations.pending, (state) => { 
        state.status = 'loading'; 
        state.error = null;
      })
      .addCase(fetchUserReservations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload; // Gelen liste items'a yazılır
      })
      .addCase(fetchUserReservations.rejected, (state, action) => {
        state.status = 'failed';
        // Hata mesajı objeyse (ValidationError), mesajı string'e çevirelim
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : Object.values(action.payload)[0]; // Backend'den gelen hata mesajı
        })
        // Delete Reservation Cases
        .addCase(deleteReservation.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
        .addCase(deleteReservation.fulfilled, (state, action) => {
            state.status = 'succeeded';
            // 🚀 Filtreleme: Silinen ID'ye sahip olanı listeden uçuruyoruz
            state.items = state.items.filter(item => item.id !== action.payload);
        })
        .addCase(deleteReservation.rejected, (state, action) => {
            state.status = 'failed';
            // Hata mesajı objeyse (ValidationError), mesajı string'e çevirelim
            state.error = typeof action.payload === 'string' 
              ? action.payload 
              : Object.values(action.payload)[0]; // Backend'den gelen hata mesajı
        });
  },
});

export const { clearReservationStatus } = reservationSlice.actions;
export default reservationSlice.reducer;