import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createReservation, clearReservationStatus } from '../features/reservationSlice'; // 🎯 Thunk'lar eklendi
import { clearBookingDates, fetchCars } from '../features/carSlice'; // 🎯 Thunk'lar eklendi
import { setNotification } from '../features/uiSlice'; // 🎯 Bildirim aksiyonu

// MUI Bileşenleri
import {
  Container,
  Box,
  Card,
  CardMedia,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Button,
  Alert, // 🎯 Hata mesajı için
} from '@mui/material';

import { 
  CalendarToday as CalendarTodayIcon, 
  Settings as SettingsIcon, 
  LocalGasStation as LocalGasStationIcon,
  AcUnit as AcUnitIcon,
  InfoOutlined as InfoIcon // 🎯 Tarih uyarısı için
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';


// Vites tipi için yardımcı etiketler
const gearLabels = { 'a': 'Otomatik', 'm': 'Manuel' };

// Özellik gösterim bileşeni
const SpecItem = ({ icon, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
    {icon}
    <Typography variant="body1" color="text.secondary">{text}</Typography>
  </Box>
);

function CarDetail() {
  const theme = useTheme(); // 🎯 Artık temanın tüm bilgilerine (mode dahil) sahipsin
  const mode = theme.palette.mode; // 'mode' ismini burada tanımlarsak alt satırlar bozulmaz

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🎯 Redux State'lerini Çekiyoruz
  const { items: cars, status: carStatus, bookingDates } = useSelector((state) => state.cars);
  const { user } = useSelector((state) => state.auth);
  const { 
    status: resStatus, 
    error: resError,
  } = useSelector((state) => state.reservations);

  // 🎯 Rezervasyon durumunu izleyelim
  const car = cars.find(c => c.id === Number(id));

  // 🎯 Toplam Fiyat ve Gün Hesaplama (CarCard ile aynı mantık)
  const calculateBookingInfo = () => {
    if (bookingDates.start && bookingDates.end) {
      const start = new Date(bookingDates.start);
      const end = new Date(bookingDates.end);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const days = diffDays === 0 ? 1 : diffDays;
      return { total: car.rent_per_day * days, days };
    }
    return null;
  };

  const bookingInfo = calculateBookingInfo();

  // 🎯 1. REZERVASYON BAŞARI TAKİBİ
  useEffect(() => {
    if (resStatus === 'succeeded') {
      // ✅ BAŞARI BİLDİRİMİ BURAYA GELİYOR
      dispatch(setNotification({ 
        message: 'Rezervasyonunuz başarıyla oluşturuldu! Keyifli sürüşler dileriz. 🏎️✨', 
        severity: 'success' 
    }));
      dispatch(clearReservationStatus());
      dispatch(clearBookingDates()); // 🎯 Rezervasyon bitince tarihleri sil!
      navigate('/my-reservations'); // Burayı kendi sayfa ismine göre güncelle
    }
  }, [resStatus, navigate, dispatch]);


  // 🎯 2. YAŞAM DÖNGÜSÜ YÖNETİMİ (Scroll, Veri Çekme ve Temizlik)
  useEffect(() => {
    
    // Eğer sayfa yenilendiyse veya direkt URL ile gelindiyse (cars listesi boşsa) verileri çek
    if (cars.length === 0 && carStatus !== 'loading') {
      dispatch(fetchCars({ start: null, end: null }));
    }

    // Cleanup: Sayfadan ayrılırken veya araç değişirken eski hataları süpür
    return () => {
      dispatch(clearReservationStatus());
    };
  }, [id, dispatch, cars.length, carStatus]); // Bağımlılıklar güncellendi



  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Rezervasyon verisini hazırla
    const payload = {
      car: car.id,
      start_date: bookingDates.start,
      end_date: bookingDates.end,
    };

    try {
      // 🚀 unwrap() kullanarak thunk'ın sonucunu (veya hatasını) bekliyoruz
      await dispatch(createReservation(payload)).unwrap();
      // Başarı durumu yukarıdaki useEffect tarafından yakalanıp bildirilecek.
    } catch (err) {
      // ❌ HATA BİLDİRİMİ
      dispatch(setNotification({ 
        message: err?.detail || 'Rezervasyon oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.', 
        severity: 'error' 
      }));
    }
  };


  // 3. RENDER KONTROLLERİ (Sıralama Önemli!)
  if (carStatus === 'loading') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
          bgcolor: 'background.default' 
          }}
        >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Eğer veri çekme bittiyse (succeeded veya failed) ve hala car yoksa da hata varsa, uygun mesajı gösterelim.
  if (!car && carStatus !== 'idle') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh', 
          bgcolor: 'background.default',
          flexDirection: 'column',
          }}
        >
        <Typography variant="h4">Araç bulunamadı.</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Ana Sayfaya Dön</Button>
      </Box>
    );
  }

  // Eğer car hala yoksa (henüz fetch bitmemiş olabilir), null dönerek crash'i engelle
  if (!car) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh', 
          bgcolor: 'background.default', 
          color: 'text.primary', 
          flexDirection: 'column',
        }}
      >
        <Typography variant="h4">Araç bulunamadı.</Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        bgcolor: 'background.default', 
        py: { xs: 4, md: 8 }, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        // flexDirection: 'column', //?
        // justifyContent: 'center', //?
        }}
    >
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: { xs: 4, md: 6 },
          alignItems: 'center', // Dikey hizalama
          justifyContent: 'center', // Yatay hizalama
        }}>
          
          {/* SOL KART: Resim */}
          <Card 
            elevation={mode === 'light' ? 8 : 2} 
            sx={{ 
              flex: '1 1 50%', 
              maxWidth: { md: 600 }, 
              borderRadius: 8, // Biraz daha yumuşak hatlar
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <CardMedia
              component="img"
              image={car.image || 'https://via.placeholder.com/800x600?text=Resim+Yok'}
              alt={`${car.brand} ${car.model}`}
              sx={{ 
                width: '100%', 
                height: 'auto', 
                objectFit: 'cover', 
                display: 'block', 
                borderRadius: 'inherit',
                bgcolor: 'white' // Araç resimleri genelde beyaz zeminli olduğu için
              }}
            />
          </Card>

          {/* SAĞ KART: Veriler */}
          <Paper 
            elevation={4} 
            sx={{ 
              flex: '1 1 50%', 
              p: { xs: 3, md: 5 }, 
              maxWidth: { md: 450 }, 
              borderRadius: 8, 
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              transition: 'background-color 0.3s ease',
              textAlign: 'center', //?
              // display: 'flex',
              // flexDirection: 'column',
              }}>

            <Chip 
              label={car.segment_display || 'Premium'} 
              color="primary" 
              sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                }} 
            />

            <Typography 
              variant="h2" 
              // component="div" 
              fontWeight="900" 
              sx={{ 
                color: 'text.primary', 
                // textAlign: 'center',
                fontSize: { xs: '2.5rem', md: '3.5rem' }, 
              }}
            >
              {car.brand}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'text.secondary', 
                mb: 3,
                textAlign: 'center',
                fontWeight: 500,
                fontSize: { xs: '1.5rem', md: '2rem' }, 
              }}
            >
              {car.model}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            {/* 🎯 REZERVASYON ÖZETİ (Tarihler seçiliyse gösterilir) */}
            {bookingDates.start && (
              <Box sx={{ mb: 3, bgcolor: 'primary.light', p: 2, borderRadius: 4, color: 'primary.contrastText' }}>
                <Typography variant="subtitle2" fontWeight="bold">Kiralama Tarihleri</Typography>
                <Typography variant="body1">{bookingDates.start} ⮕ {bookingDates.end}</Typography>
              </Box>
            )}

            <Typography 
              variant="h6" 
              fontWeight="600" 
              sx={{ 
                mb: 2, 
                color: 'text.primary', 
                // textAlign: 'center',
                // fontSize: { xs: '1.2rem', md: '1.5rem' }, 
              }}
            >
              Araç Özellikleri
            </Typography>
            <SpecItem icon={<CalendarTodayIcon color="primary" />} text={`${car.year} Model`} />
            <SpecItem icon={<SettingsIcon color="primary" />} text={gearLabels[car.gear] || 'Belirtilmemiş'} />
            <SpecItem icon={<LocalGasStationIcon color="primary" />} text={car.fuel_type_display || 'Belirtilmemiş'} />
            <SpecItem icon={<AcUnitIcon color="primary" />} text={car.has_ac ? "Klima Mevcut" : "Klima Yok"} />

            <Divider sx={{ my: 3 }} />

            {/* 🎯 FİYAT VE BUTON ALANI */}
            <Box sx={{ mt: 1 }}>
              {bookingInfo ? (
                <>
                  <Typography variant="overline" color="text.secondary">Toplam Tutar ({bookingInfo.days} Gün)</Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary.main" sx={{ mb: 2 }}>
                    {Number(bookingInfo.total).toLocaleString('tr-TR')} TL
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="overline" color="text.secondary">Günlük Bedel</Typography>
                  <Typography variant="h3" fontWeight="bold" color="success.main" sx={{ mb: 2 }}>
                    {Number(car.rent_per_day).toLocaleString('tr-TR')} TL
                  </Typography>
                </>
              )}

              {/* 🎯 HATA MESAJI (Backend'den gelen hata) */}
              {resError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                  {typeof resError === 'string' ? resError : "Bu araç o tarihlerde zaten dolu!"}
                </Alert>
              )}


              {/* 🎯 TARİH SEÇİLİ DEĞİLSE: Akıllı Yönlendirme Butonu */}
              {!bookingDates.start ? (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2, 
                    justifyContent: 'center', 
                    color: 'warning.main',
                    bgcolor: 'warning.lighter', // Soft bir arka plan (MUI temanda tanımlıysa)
                    p: 1.5,
                    borderRadius: 3
                  }}>
                    <InfoIcon fontSize="small" />
                    <Typography variant="body2" fontWeight="bold">
                      Bu aracı kiralamak için lütfen tarih seçin.
                    </Typography>
                  </Box>

                  {/* 🚀 ANA SAYFAYA DÖNÜŞ BUTONU */}
                  <Button 
                    variant="outlined" 
                    color="warning" 
                    fullWidth
                    startIcon={<CalendarTodayIcon />}
                    onClick={() => navigate('/')}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 4, 
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2, bgcolor: 'warning.lighter' }
                    }}
                  >
                    Tarih Seçmek İçin Ana Sayfaya Dön
                  </Button>
                </Box>
                ) : (
                /* 🎯 TARİH SEÇİLİYSE: Standart Kirala Butonu */
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  size="large" 
                  disabled={resStatus === 'loading'}
                  onClick={handleBooking}
                  sx={{ 
                    py: 2, borderRadius: 4, fontWeight: '900', fontSize: '1.2rem', textTransform: 'none',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-3px)' }
                  }}
                >
                  {resStatus === 'loading' ? <CircularProgress size={28} color="inherit" /> : 'Hemen Kirala'}
                </Button>
                   )}            
                </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default CarDetail;
