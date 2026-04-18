import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../config/axiosConfig';

// 1. ASYNC THUNK: Backend'den arabaları çeken asenkron fonksiyon
export const fetchCars = createAsyncThunk('cars/fetchCars', async (dateParams = {}, { rejectWithValue }) => {
  try {
    // dateParams: { start: '2026-04-10', end: '2026-04-15' } formatında gelecek
    let url = '/api/car/';
    // Eğer tarih parametreleri gönderilmişse URL'e query string olarak ekle
    if (dateParams.start && dateParams.end) {
      url += `?start=${dateParams.start}&end=${dateParams.end}`;
    }
    const response = await axiosInstance.get(url);
    return response.data; // Django'dan gelen [{brand: 'Audi', image: 's3_url'...}]
  } catch (error) {
    // 🎯 İpucu: error.response?.data şeklinde kullanmak, 
    // internet kesilmesi gibi durumlarda uygulamanın çökmesini engeller.
    return rejectWithValue(error.response?.data || 'Araçlar çekilemedi');
  }
});


// 🚀 Staff Dashboard 1. Araç Durumunu Güncelle (PATCH)-Aşağıda update ile birleştirdik.
// export const updateCarStatus = createAsyncThunk(
//   'cars/updateStatus',
//   async ({ id, availability }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.patch(`/api/car/${id}/`, { availability });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Güncelleme başarısız');
//     }
//   }
// );

// 🚀 Staff Dashboard 2. Yeni Araç Ekle (POST)
export const addCar = createAsyncThunk(
  'cars/add',
  async (carData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/car/', carData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Araç eklenemedi');
    }
  }
);

// 🚀 Staff Dashboard 1. Mevcut Aracı Güncelle
export const updateCar = createAsyncThunk(
  'cars/update',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      // updateData: Düz bir obje { availability: true } veya bir FormData olabilir.
      // axios her ikisini de otomatik tanır.
      const response = await axiosInstance.patch(`/api/car/${id}/`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Güncelleme başarısız');
    }
  }
);

// 🚀 Staff Dashboard 2. Aracı Sil
export const deleteCar = createAsyncThunk(
  'cars/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/car/${id}/`);
      return id; // Silinen ID'yi döndürüyoruz ki state'den çıkaralım
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Silme işlemi başarısız');
    }
  }
);


// 2. SLICE: Verinin state içindeki yönetimi
const carSlice = createSlice({
  name: 'cars',
  initialState: {
    items: [],
    // 🎯 Global tarihlerimiz burada duracak
    bookingDates: {
      start: null,
      end: null,
    },
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // 🎯 Tarihleri güncellemek için kullanacağımız action
    setBookingDates: (state, action) => {
      state.bookingDates = action.payload;
    },
    // 🎯 Rezervasyon sonrası tarihleri sıfırlamak gerekirse
    clearBookingDates: (state) => {
      state.bookingDates = { start: null, end: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCars.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload; // Gelen verileri items dizisine aktarıyoruz
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // .addCase(updateCarStatus.fulfilled, (state, action) => {
      //   const index = state.items.findIndex(car => car.id === action.payload.id);
      //   if (index !== -1) state.items[index] = action.payload;
      // })
      .addCase(addCar.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteCar.fulfilled, (state, action) => {
        state.items = state.items.filter(car => car.id !== action.payload);
      })
      .addCase(updateCar.fulfilled, (state, action) => {
        const index = state.items.findIndex(car => car.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export const { setBookingDates, clearBookingDates } = carSlice.actions;
export default carSlice.reducer;