import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import ScrollToTop from './components/ScrollToTop';

import { fetchCars } from './features/carSlice';
import { Box } from '@mui/material';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

import Home from './pages/Home';
import CarDetail from './pages/CarDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyReservations from './pages/MyReservations';
import StaffDashboard from './pages/StaffDashboard';

import { clearBookingDates } from './features/carSlice';
import Notification from './components/Notification';

function App() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.cars);

  // Temayı localStorage'dan oku (Kullanıcı sayfayı yenileyince gitmesin)
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

  useEffect(() => {
    dispatch(fetchCars());
    dispatch(clearBookingDates());
  }, [dispatch]);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode); // Tercihi kaydet
      return newMode;
    });
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        // 🎯 Sayfa arka planı artık daha açık (#f8f9fa)
        default: mode === 'light' ? '#f8f9fa' : '#121212', 
        // 🎯 Navbar, Menü ve Kartlar artık bir tık daha koyu gri (#f0f2f5)
        paper: mode === 'light' ? '#f0f2f5' : '#1e1e1e',
    },
  },
  shape: {
    borderRadius: 12,
  },
  }), [mode]);
  

  return (
    <BrowserRouter>
    <ScrollToTop />
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* 👈 Kritik: Arka plan rengini otomatik değiştirir */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh', 
          bgcolor: 'background.default',
          transition: 'background-color 0.3s ease', 
        }}
      >
        {/* Navbar'a mod bilgisini ve değiştirme fonksiyonunu gönderiyoruz */}
        <Navbar mode={mode} toggleTheme={toggleTheme} />
        <Notification /> {/* 🎯 Her zaman burada, tetiklenmeyi bekliyor */}

        <Routes>
          <Route path="/" element={<Home items={items} status={status} />} />
          <Route path="/car/:id" element={<CarDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
        </Routes>

        <Footer />
      </Box>
    </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
