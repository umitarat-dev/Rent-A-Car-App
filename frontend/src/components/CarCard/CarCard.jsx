import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // 🎯 1. Redux'tan veri çekmek için import ettik
import { Card, CardMedia, CardContent, Typography, Box, Divider, Button, Chip } from '@mui/material';

// Django'dan gelen kısa kodları uzun isimlere çevirme sözlüğü
// const segmentLabels = { 's': 'SUV', 'p': 'Premium', 'c': 'Comfort', 'e': 'Economy' };

export default function CarCard({ car }) {
  const navigate = useNavigate();

  // 🎯 2. Redux'taki global tarihlerimizi alıyoruz
  const { bookingDates } = useSelector((state) => state.cars);

  // 🎯 3. Toplam fiyatı hesaplayan yardımcı fonksiyon
  const calculateTotal = (dailyPrice) => {
    if (bookingDates.start && bookingDates.end) {
      const start = new Date(bookingDates.start);
      const end = new Date(bookingDates.end);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Eğer aynı gün seçildiyse en az 1 gün sayalım
      const days = diffDays === 0 ? 1 : diffDays;
      return {
        total: dailyPrice * days,
        days: days
      };
    }
    return null;
  };

  const totalPriceInfo = calculateTotal(car.rent_per_day);

  // Sayı formatlama (Günlük için)
  const formattedDailyPrice = car.rent_per_day 
    ? Number(car.rent_per_day).toLocaleString('tr-TR', { maximumFractionDigits: 0 }) 
    : '0';

  // Sayı formatlama (Toplam için)
  const formattedTotalPrice = totalPriceInfo 
    ? Number(totalPriceInfo.total).toLocaleString('tr-TR', { maximumFractionDigits: 0 }) 
    : null;

  return (
    <Card sx={{ 
      width: '100%', 
      //   height: 520, // Daha kompakt iskelet
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 6,
      overflow: 'hidden',
      boxShadow: (theme) => theme.palette.mode === 'light' 
        ? '0px 10px 40px rgba(0,0,0,0.06)' 
        : '0px 10px 40px rgba(0,0,0,0.4)',
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper', // 🎯 Kartın ana rengi
      transition: '0.4s ease',
      '&:hover': { 
        transform: 'translateY(-10px)', 
        boxShadow: (theme) => theme.palette.mode === 'light'
          ? '0px 20px 50px rgba(0,0,0,0.1)'
          : '0px 20px 50px rgba(0,0,0,0.6)' 
      }
    }}>
      
      {/* 🖼️ RESİM ALANI GERİ GELDİ - STANDARTLAŞTIRILMIŞ VE RİGİD YAPISIYLA 🚀 */}
      <Box sx={{ 
        height: 210, // Daha kompakt görsel alanı
        minHeight: 205, // Esnemeyi kilitle
        bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'inherit', // Kartın köşe yarıçapını miras alır
        p: 1.5, // Üst/alt boşluğu biraz daralt
        overflow: 'hidden', // Taşmaları keser
        position: 'relative' // Görselin layout'u bozmasını engelle
      }}>
        <CardMedia
          component="img"
          // car.image S3 URL'ini taşır. Yoksa placeholder koyarız.
          image={car.image || 'https://via.placeholder.com/400x250?text=Resim+Yok'}
          alt={car.brand}
          sx={{ 
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain', // Kırpma yok, görsel kutuya sığar
            objectPosition: 'center',
            display: 'block',
            // borderRadius: 6,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
            backgroundColor: 'transparent'
          }}
        />
      </Box>

      {/* 📝 İÇERİK ALANI: Jilet gibi hizalı alan */}
      <CardContent
        sx={{
          flex: '1 1 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          p: 3,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Üst Kısım: Marka, Model, Vites */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.primary', lineHeight: 1.1 }}>
                {car.brand || "MARKA"}
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5, fontSize: '1.1rem' }}>
                {car.model || "Model Bilgisi"}
              </Typography>
            </Box>
            <Chip 
              label={car.gear || "A"} 
              sx={{ 
                fontWeight: 'bold', 
                bgcolor: 'primary.light', 
                color: 'primary.contrastText', 
                borderRadius: 2 
              }} 
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5 }}>
             {car.segment_display || car.segment} SEGMENTİ
          </Typography>
        </Box>

        {/* Alt Kısım: Fiyat ve Buton (justifyContent sayesinde hep dipte kalacak) */}
        <Box sx={{ mt: 'auto' }}> {/* Fiyatları aşağı yaslamak için mt: 'auto' ekledik */}
          <Divider sx={{ my: 2, opacity: 0.6 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              {/* 🎯 EĞER TARİHLER SEÇİLİYSE TOPLAM TUTARI GÖSTER */}
              {totalPriceInfo ? (
                <>
                  <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800 }}>
                    {formattedTotalPrice} TL
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem', display: 'block' }}>
                    {totalPriceInfo.days} gün için toplam tutar
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                    (Günlük: {formattedDailyPrice} TL)
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 800 }}>
                    {formattedDailyPrice} TL
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                    günlük kiralama bedeli
                  </Typography>
                </>
              )}
            </Box>
            <Button 
              variant="contained" 
              size="small"
              onClick={() => navigate(`/car/${car.id}`)}
              sx={{ 
                borderRadius: 3, 
                px: 2.5, 
                py: 0.9, 
                fontWeight: 'bold', 
                textTransform: 'none',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: 'none',
                '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' }
              }}
            >
              İncele
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
