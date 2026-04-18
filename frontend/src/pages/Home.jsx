import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Box, Typography, Divider } from '@mui/material';
import { fetchCars } from '../features/carSlice';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar'; // 🎯 Yeni component
import SegmentSection from '../components/SegmentSection';

function Home() {
  const dispatch = useDispatch();
  const { items, status, bookingDates } = useSelector((state) => state.cars);
  
  // 🎯 Local State: Seçili segmenti takip edelim
  const [selectedSegment, setSelectedSegment] = useState('');

  useEffect(() => {
    // Sayfa ilk açıldığında veya segment değiştiğinde veriyi çek
    // bookingDates zaten Redux'ta saklandığı için onları da gönderiyoruz
    dispatch(fetchCars({ 
      ...bookingDates, 
      segment: selectedSegment 
    }));
  }, [dispatch, selectedSegment, bookingDates]); // selectedSegment değiştikçe tetiklenir

  const handleSegmentChange = (segment) => {
    setSelectedSegment(segment);
  };

  const currentItems = items || [];

  // 🎯 YENİ: Önce sadece müsait olan araçları seçelim
  const availableItems = currentItems.filter(car => 
    car.availability === true || car.is_available === true
  );

  // Segment bazlı filtreleme (Frontend'de gruplandırma)
  const economyCars = availableItems.filter(car => car.segment === 'e');
  const comfortCars = availableItems.filter(car => car.segment === 'c');
  const premiumCars = availableItems.filter(car => car.segment === 'p');
  const suvCars = availableItems.filter(car => car.segment === 's');

  return (
    <Container maxWidth={false} sx={{ py: 6, bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* 1. HERO ALANI */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" fontWeight="900" gutterBottom sx={{ letterSpacing: '-1px' }}>
          Yolculuğun Burada Başlıyor
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Dilediğin tarihler için en uygun aracı hemen bul.
        </Typography>
      </Box>

      {/* 2. SEARCH BAR */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, position: 'relative', zIndex: 10 }}>
        <SearchBar />
      </Box>

      {/* 🎯 3. FILTER BAR (Yeni Oyuncumuz) */}
      <FilterBar 
        selectedSegment={selectedSegment} 
        onSegmentChange={handleSegmentChange} 
      />

      <Divider sx={{ mb: 6, opacity: 0.6 }} />

      {/* 4. DİNAMİK SEGMENT LİSTELERİ */}
      <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
        
        {/* Eğer bir segment seçilmişse sadece onu göster, seçilmemişse (boşsa) hepsini göster */}
        {(selectedSegment === '' || selectedSegment === 's') && suvCars.length > 0 && (
          <SegmentSection title="SUV / Arazi" cars={suvCars} />
        )}
        
        {(selectedSegment === '' || selectedSegment === 'p') && premiumCars.length > 0 && (
          <SegmentSection title="Premium / Lüks" cars={premiumCars} />
        )}
        
        {(selectedSegment === '' || selectedSegment === 'c') && comfortCars.length > 0 && (
          <SegmentSection title="Konfor Sınıfı" cars={comfortCars} />
        )}
        
        {(selectedSegment === '' || selectedSegment === 'e') && economyCars.length > 0 && (
          <SegmentSection title="Ekonomi Sınıfı" cars={economyCars} />
        )}

        {/* ARAÇ BULUNAMADI DURUMU */}
        {currentItems.length === 0 && status !== 'loading' && (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
             <Typography variant="h5" color="text.secondary" gutterBottom>
              Üzgünüz, aradığınız kriterlerde araç bulunamadı.
            </Typography>
            <Typography variant="body1" color="text.disabled">
              Farklı bir segment veya tarih aralığı denemeye ne dersiniz?
            </Typography>
          </Box>
        )}
      </Box>

    </Container>
  );
};

export default Home;