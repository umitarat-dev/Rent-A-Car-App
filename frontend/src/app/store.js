import { configureStore } from '@reduxjs/toolkit';
// carSlice'ı birazdan oluşturacağız, şimdilik hata vermemesi için yorum satırı yapabilirsin
import carReducer from '../features/carSlice';
import authReducer from '../features/authSlice'; 
import reservationReducer from '../features/reservationSlice';
import uiReducer from '../features/uiSlice';

export const store = configureStore({
  reducer: {
    cars: carReducer,
    auth: authReducer, 
    ui: uiReducer,
    reservations: reservationReducer,
  },
});