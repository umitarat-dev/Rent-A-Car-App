import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserReservations, deleteReservation, clearReservationStatus } from '../features/reservationSlice';
import { 
  Container, Typography, Box, Card, CardContent, Grid, 
  Button, CircularProgress, Alert, Divider, Paper
} from '@mui/material';
import { 
  DirectionsCar, 
  CalendarMonth, 
  Payments, 
  EventBusy, 
  SentimentDissatisfied 
} from '@mui/icons-material';
import { setNotification } from '../features/uiSlice';


const MyReservations = () => {
  const dispatch = useDispatch();
  
  // 🎯 DİKKAT: store.js'deki 'reservations' anahtarına göre çekiyoruz
  const { items, status, error } = useSelector((state) => state.reservations);

  // Sayfa açıldığında rezervasyonları çek
  useEffect(() => {
    dispatch(fetchUserReservations());

    // 🎯 Cleanup: Sayfadan çıkarken status'u 'idle' yap
    return () => {
      dispatch(clearReservationStatus());
    };
  }, [dispatch]);

  // Silme (İptal) işlemi
  const handleCancel = async (id) => {
    if (window.confirm('Bu rezervasyonu iptal etmek istediğinize emin misiniz?')) {
      try {
        // 🚀 İşlemi yap ve bitmesini bekle (unwrap ile hata yakalamayı açıyoruz)
        await dispatch(deleteReservation(id)).unwrap();
        // ✅ BAŞARI BİLDİRİMİ
        dispatch(setNotification({ 
          message: 'Rezervasyonunuz başarıyla iptal edildi. Ücret iadesi başlatıldı.', 
          severity: 'success' 
        }));

      } catch (error) {
        // ❌ HATA BİLDİRİMİ
        dispatch(setNotification({ 
          message: 'İptal işlemi sırasında bir sorun oluştu: ' + (error?.message || 'Hata!'), 
          severity: 'error' 
        }));
      }
    }
  };

  // 🌀 Yükleniyor Durumu
  if (status === 'loading' && items.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8, minHeight: '100vh' }}>
      <Typography 
        variant="h3" 
        fontWeight="900" 
        gutterBottom 
        sx={{ 
          mb: 6, 
          // textAlign: { xs: 'center', md: 'left' } 
          textAlign: 'center' 
        }}
      >
        Rezervasyonlarım
      </Typography>

      {/* 🚨 Hata Durumu */}
      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

      {/* 🎯 İÇERİK ALANI: Tüm içeriği ortalayan Box */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* 📭 Boş Liste Durumu */}
      {items.length === 0 && status !== 'loading' ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 8, 
            textAlign: 'center', 
            borderRadius: 8, 
            bgcolor: 'background.paper', 
            border: '1px dashed grey', 
            width: '100%',
            maxWidth: '800px',
          }}
        >
          <SentimentDissatisfied sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Henüz bir araç kiralamadınız.
          </Typography>
          <Button variant="contained" href="/" sx={{ mt: 3, px: 4, py: 1.5, borderRadius: 3, fontWeight: 'bold' }}>
            Hemen Araçları İncele
          </Button>
        </Paper>
      ) : (
        <Grid 
          container 
          spacing={4}
          justifyContent='center'
        >
          {items.map((res) => (
            <Grid item xs={12} md={10} lg={9} key={res.id} >
              <Card sx={{ 
                borderRadius: 6, 
                border: '1px solid', 
                borderColor: 'divider',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3} alignItems="center">
                    
                    {/* 1. Araç Bilgisi */}
                    <Grid item xs={12} md={4}>
                      <Box 
                        sx={{
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 3,
                          justifyContent: { xs: 'center', md: 'flex-start' }
                        }}
                      >
                        {/* 🎯 PRO DOKUNUŞ: Eğer car_details içinde resim varsa ufak bir thumbnail gösterelim */}
                        <Box
                          component="img"
                          src={res.car_details?.image || 'https://via.placeholder.com/80x60?text=No+Image'}
                          alt={res.car_details.brand}
                          sx={{ 
                            width: 100, 
                            height: 80, 
                            // objectFit: 'contain', 
                            objectFit: 'cover', 
                            borderRadius: 2,
                            bgcolor: 'rgba(0,0,0,0.03)',
                            p: 0.5 
                          }}
                        />
                        <Box>
                          <Typography 
                            variant="h6" 
                            fontWeight="900"
                            sx={{ 
                              textTransform: 'uppercase',
                              lineHeight: 1.2 
                            }}
                          >
                            {res.car_details?.brand} {res.car_details?.model}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {res.car_details?.segment_display} Segmenti | {res.car_details?.year} Model
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* 2. Tarih Bilgisi */}
                    <Grid item xs={12} md={5}>
                      <Box display="flex" justifyContent="space-around" alignItems="center">
                        <Box textAlign="center">
                          <Typography variant="caption" color="text.disabled" fontWeight="bold">ALIŞ</Typography>
                          <Typography variant="body1" fontWeight="600">{res.start_date}</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                        <Box textAlign="center">
                          <Typography variant="caption" color="text.disabled" fontWeight="bold">TESLİM</Typography>
                          <Typography variant="body1" fontWeight="600">{res.end_date}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* 3. Fiyat ve İşlemler */}
                    <Grid item xs={12} md={4}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: { 
                            // md: 'flex-end', 
                            xs: 'center' 
                          }, 
                          gap: 1 }}>
                        <Typography variant="h4" fontWeight="900" color="primary.main">
                          {Number(res.total_price).toLocaleString('tr-TR')} TL
                        </Typography>
                        <Button 
                          variant="text" 
                          color="error" 
                          startIcon={<EventBusy />}
                          onClick={() => handleCancel(res.id)}
                          sx={{ 
                            fontWeight: 'bold', 
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'error.lighter' } 
                          }}
                        >
                          Rezervasyonu İptal Et
                        </Button>
                      </Box>
                    </Grid>

                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      </Box>
    </Container>
  );
};

export default MyReservations;