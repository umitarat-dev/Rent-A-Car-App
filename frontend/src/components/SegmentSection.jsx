import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import CarCard from './CarCard/CarCard';

export default function SegmentSection({ title, cars }) {
  if (cars.length === 0) return null;

  return (
    <Box sx={{ mb: 10 }}>
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: 1400, 
          mx: 'auto', 
          bgcolor: 'background.paper', 
          p: 4, 
          borderRadius: 4, 
          boxShadow: (theme) => theme.palette.mode === 'light' 
          ? '0 10px 30px rgba(0,0,0,0.05)' 
          : '0 10px 30px rgba(0,0,0,0.3)', // 🎯 Karanlık modda gölge daha belirgin
          transition: 'background-color 0.3s ease' 
        }}
      >
        {/* Şık Başlık Alanı */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 5,
          borderLeft: '8px solid #1976d2', 
          pl: 5,
          background: (theme) => theme.palette.mode === 'light' 
            ? 'linear-gradient(to right, #f8f9fa, transparent)' 
            : 'linear-gradient(to right, rgba(255, 255, 255, 0.05), transparent)',
          py: 1
        }}>
          <Typography 
            variant="h4" 
            fontWeight="900" 
            sx={{ 
              color: 'text.primary', 
              fontWeight: 'bold',
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>
            ({cars.length} Araç)
          </Typography>
        </Box>

        {/* İŞTE KRİTİK AYAR BURASI: */}
        {/* spacing={4} ve md={4} kombinasyonu kartları 1/3 genişliğe kilitler */}
        <Grid container spacing={3} justifyContent="space-evenly">
        {cars.map((car) => (
          <Grid
            key={car.id} 
            size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}  // Kartların kendi içeriğine göre genişlemesini sağlar
            sx={{ 
              display: 'flex',
              flexBasis: { xs: '100%', sm: '50%', md: '33.3333%', lg: '33.3333%', xl: '25%' },
              maxWidth: { xs: '100%', sm: '50%', md: '33.3333%', lg: '33.3333%', xl: '25%' }
            }} // Kartların içini doldurması ve eşit boyda olması için
          >
            <CarCard car={car} />
          </Grid>
        ))}
        </Grid>
      </Box>
    </Box>
  );
}
