import React, { useState } from 'react';
import { Box, TextField, Button, Paper, useTheme, IconButton, Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCars, setBookingDates } from '../features/carSlice';
import { RestartAlt } from '@mui/icons-material'; // 🎯 Sıfırlama ikonu

const SearchBar = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const dispatch = useDispatch();
  
  // 🎯 Redux'taki tarihleri takip edelim (butonun görünüp görünmemesi için)
  const { bookingDates } = useSelector((state) => state.cars);

  const [localDates, setLocalDates] = useState({ 
    start: bookingDates.start || '', 
    end: bookingDates.end || '' 
  });

  const handleSearch = () => {
    if (localDates.start && localDates.end) {
      if (localDates.start >= localDates.end) {
        alert('Bitiş tarihi başlangıçtan sonra olmalıdır!');
        return;
      }
      dispatch(setBookingDates(localDates));
      dispatch(fetchCars(localDates));
    } else {
      alert('Lütfen her iki tarihi de doldurun!');
    }
  };

  // 🎯 SIFIRLAMA FONKSİYONU
  const handleClear = () => {
    const clearedDates = { start: null, end: null };
    setLocalDates({ start: '', end: '' }); // Local state'i temizle
    dispatch(setBookingDates(clearedDates)); // Redux'u temizle
    dispatch(fetchCars(clearedDates)); // Tüm araçları tekrar getir
  };

  return (
    <Paper 
      elevation={isDarkMode ? 8 : 2}
      sx={{ 
        p: 3, mt: -4, borderRadius: 6, display: 'flex', gap: 2, flexWrap: 'wrap',
        justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s',
        bgcolor: isDarkMode ? 'background.paper' : 'background.default',
        border: isDarkMode ? '1px solid #333' : '1px solid #ddd',
      }}
    >
      <TextField
        label="Başlangıç Tarihi"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={localDates.start}
        onChange={(e) => setLocalDates({ ...localDates, start: e.target.value })}
        sx={{ flex: 1, minWidth: '200px' }}
      />
      <TextField
        label="Bitiş Tarihi"
        type="date"
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: localDates.start }}
        value={localDates.end}
        onChange={(e) => setLocalDates({ ...localDates, end: e.target.value })}
        sx={{ flex: 1, minWidth: '200px' }}
      />

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button 
          variant="contained" 
          onClick={handleSearch} 
          sx={{ 
            px: 4, py: 1.8, borderRadius: 4, fontWeight: 900, textTransform: 'none',
            bgcolor: isDarkMode ? 'secondary.main' : 'primary.main',
            '&:hover': { transform: 'scale(1.02)' }
          }}
        >
          Müsait Araçları Bul
        </Button>


        {/* 🎯 SIFIRLAMA BUTONU: Yenilenmiş, Canlı ve Hareketli */}
        {(bookingDates.start || localDates.start) && (
          <Tooltip title="Tarihleri ve Filtreleri Sıfırla">
            <IconButton 
              onClick={handleClear}
              sx={{ 
                // 🎨 Renk ve Arkaplan
                bgcolor: isDarkMode ? 'rgba(255, 152, 0, 0.05)' : 'rgba(255, 152, 0, 0.05)', 
                color: 'warning.main',
                border: '2px solid',
                borderColor: isDarkMode ? 'rgba(255, 152, 0, 0.3)' : 'warning.light',
                p: 1.2,
                borderRadius: 4, // Karemsi-yuvarlak modern form
                // ✨ Geçiş Efektleri
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',

                '&:hover': { 
                  // bgcolor: 'warning.main',
                  bgcolor: isDarkMode 
                    ? 'rgba(255, 152, 0, 0.15)' // Tam turuncu yerine %15 şeffaf turuncu
                    : 'warning.main',           // Light mode'da dolgun renk devam edebilir 
                  color: '#fff',
                  borderColor: 'warning.main',
                  transform: 'scale(1.1) rotate(180deg)', // 🔄 Hem büyür hem de yarım tur döner
                  boxShadow: isDarkMode 
                    ? '0 0 15px rgba(255, 152, 0, 0.2)' 
                    : '0 4px 12px rgba(255, 152, 0, 0.3)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                }
              }}
            >
              <RestartAlt sx={{ fontSize: '1.8rem' }} /> {/* İkonu biraz büyüttük */}
            </IconButton>
          </Tooltip>
        )}



      </Box>
    </Paper>
  );
};

export default SearchBar;