import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    notification: {
      open: false,
      message: '',
      severity: 'success', // 'success', 'error', 'info', 'warning'
    },
  },
  reducers: {
    setNotification: (state, action) => {
      state.notification = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'success',
      };
    },
    clearNotification: (state) => {
      state.notification.open = false;
    },
  },
});

export const { setNotification, clearNotification } = uiSlice.actions;
export default uiSlice.reducer;