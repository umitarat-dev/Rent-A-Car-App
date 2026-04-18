import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Chip, Tooltip, CircularProgress, Switch, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid, FormControlLabel, 
  Checkbox, Avatar 
} from '@mui/material';
import { 
  Assessment as StatsIcon, 
  DirectionsCar as CarIcon, 
  ListAlt as BookingIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon, 
  CloudUpload as UploadIcon,
  MonetizationOn as MoneyIcon,
  CheckCircle as AvailableIcon,
} from '@mui/icons-material';

import { useSelector, useDispatch } from 'react-redux';
import { fetchUserReservations, deleteReservation } from '../features/reservationSlice';
import { setNotification } from '../features/uiSlice';
import { updateCar, addCar, deleteCar } from '../features/carSlice';

// 📊 Grafik bileşenleri
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart'; 


const StaffDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const dispatch = useDispatch();

  // Redux State
  const { items, status } = useSelector((state) => state.reservations);
  const { items: cars } = useSelector((state) => state.cars);

  // Modal ve Form State
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCarId, setCurrentCarId] = useState(null);
  
  const [newCar, setNewCar] = useState({
    brand: '', model: '', year: new Date().getFullYear(), 
    plate_number: '', rent_per_day: '', segment: '', 
    gear: '', fuel_type: '', has_ac: true,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    dispatch(fetchUserReservations());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  // --- 📝 ARAÇ İŞLEMLERİ ---

  const handleEditClick = (car) => {
    console.log("Düzenlenen Araç Verisi:", car);
    setIsEditing(true);
    setCurrentCarId(car.id);

    // 🎯 YAKIT KURTARMA: Backend'den fuel_type gelmiyorsa display isminden yakalıyoruz
    let detectedFuel = car.fuel_type; 
    if (!detectedFuel && car.fuel_type_display) {
      const fuelMap = {
        "Benzin": "gasoline",
        "Dizel": "diesel",
        "Hibrit": "hybrid",
        "Elektrik": "electric"
      };
      detectedFuel = fuelMap[car.fuel_type_display];
    }

    setNewCar({
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || new Date().getFullYear(),
      plate_number: car.plate_number || '',
      rent_per_day: car.rent_per_day || '',
      segment: car.segment || '',
      gear: car.gear || '',
      fuel_type: detectedFuel || '', // ✅ BURASI DÜZELTİLDİ: Artık 'detectedFuel' kullanılıyor
      has_ac: car.has_ac ?? true,
    });
    setPreviewUrl(car.image);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsEditing(false);
    setCurrentCarId(null);
    setNewCar({
      brand: '', model: '', year: new Date().getFullYear(),
      plate_number: '', rent_per_day: '', segment: '',
      gear: '', fuel_type: '', has_ac: true,
    });
    setPreviewUrl('');
    setSelectedFile(null);
  };

  const handleSaveCar = async () => {
    const formData = new FormData();
    Object.entries(newCar).forEach(([key, value]) => {
      if (key !== 'image' && key !== 'is_available') {
        formData.append(key, key === 'has_ac' ? (value ? 'true' : 'false') : value);
      }
    });

    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      if (isEditing) {
        await dispatch(updateCar({ id: currentCarId, updateData: formData })).unwrap();
        dispatch(setNotification({ message: 'Araç güncellendi!', severity: 'success' }));
      } else {
        formData.append('availability', 'true');
        await dispatch(addCar(formData)).unwrap();
        dispatch(setNotification({ message: 'Yeni araç eklendi!', severity: 'success' }));
      }
      handleCloseModal();
    } catch (err) {
      let errorMsg = 'İşlem başarısız.';
      if (err && typeof err === 'object') {
        const firstError = Object.values(err)[0];
        errorMsg = Array.isArray(firstError) ? firstError[0] : (err.detail || err.message || errorMsg);
      }
      dispatch(setNotification({ message: errorMsg, severity: 'error' }));
    }
  };

  const handleDeleteCar = async (id) => {
    if (window.confirm('Bu aracı filodan TAMAMEN silmek istediğinize emin misiniz?')) {
      try {
        await dispatch(deleteCar(id)).unwrap();
        dispatch(setNotification({ message: 'Araç filodan kaldırıldı.', severity: 'info' }));
      } catch (err) {
        // 🎯 Hata mesajını ayıklama mantığı (handleSaveCar ile aynı)
        let errorMsg = 'Silme işlemi başarısız.';
        if (err && typeof err === 'object') {
          const firstError = Object.values(err)[0];
          errorMsg = Array.isArray(firstError) ? firstError[0] : (err.detail || err.message || errorMsg);
        }
        dispatch(setNotification({ message: errorMsg, severity: 'error' }));
      }
    }
  };

  const handleToggleAvailability = (id, currentStatus) => {
    dispatch(updateCar({ id, updateData: { availability: !currentStatus } }));
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm('Bu rezervasyonu SİLMEK istediğinize emin misiniz?')) {
      try {
        await dispatch(deleteReservation(id)).unwrap();
        dispatch(setNotification({ message: 'Rezervasyon silindi.', severity: 'success' }));
      } catch (error) {
        dispatch(setNotification({ message: 'Hata: ' + error, severity: 'error' }));
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- 📈 İSTATİSTİKLER ---
  const totalRevenue = items.reduce((acc, curr) => acc + Number(curr.total_price || 0), 0);
  const activeReservations = items.filter(res => {
    const today = new Date().toISOString().split('T')[0];
    return res.start_date <= today && res.end_date >= today;
  }).length;

  const statsCards = [
    { label: 'Toplam Ciro', value: `${totalRevenue.toLocaleString('tr-TR')} TL`, icon: <MoneyIcon />, color: '#2e7d32', bg: '#e8f5e9' },
    { label: 'Aktif Filo', value: cars.length, icon: <CarIcon />, color: '#0288d1', bg: '#e1f5fe' },
    { label: 'Toplam Kiralama', value: items.length, icon: <BookingIcon />, color: '#ed6c02', bg: '#fff3e0' },
    { label: 'Şu An Kirada', value: activeReservations, icon: <StatsIcon />, color: '#9c27b0', bg: '#f3e5f5' },
  ];

  const segmentChartData = cars?.length > 0 ? [
    { id: 0, value: cars.filter(c => c.segment === 'e').length, label: 'Ekonomi' },
    { id: 1, value: cars.filter(c => c.segment === 'c' || c.segment === 'm').length, label: 'Konfor' },
    { id: 2, value: cars.filter(c => c.segment === 'p').length, label: 'Premium' },
  ] : [];

  const brands = [...new Set(cars.map(c => c.brand))];
  const revenueByBrand = brands.map(brand => {
    const brandTotal = items
      .filter(res => res.car_details?.brand === brand)
      .reduce((sum, res) => sum + Number(res.total_price || 0), 0);
    return { brand, revenue: brandTotal };
  }).filter(item => item.revenue > 0);


  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight="900" gutterBottom align="center" sx={{ mb: 6 }}>
        Filo Yönetim Paneli
      </Typography>
      
      <Paper elevation={4} sx={{ borderRadius: 6, overflow: 'hidden', mt: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered variant="fullWidth" indicatorColor="secondary" textColor="secondary" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<StatsIcon />} label="GENEL BAKIŞ" />
          <Tab icon={<BookingIcon />} label="TÜM REZERVASYONLAR" />
          <Tab icon={<CarIcon />} label="ARAÇ ENVANTERİ YÖNETİMİ" />
        </Tabs>

        <Box sx={{ p: 4, minHeight: '60vh', position: 'relative' }}>

          {/* 🎯 İŞTE LOADING BURADA: Status loading iken spinner döner */}
          {status === 'loading' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '40vh', gap: 2 }}>
              <CircularProgress color="secondary" size={60} thickness={4} />
              <Typography variant="h6" color="text.secondary">Veriler Hazırlanıyor...</Typography>
            </Box>
          ) : (
            <>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  {statsCards.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Avatar sx={{ bgcolor: stat.bg, color: stat.color, width: 56, height: 56 }}>{stat.icon}</Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" fontWeight="600">{stat.label}</Typography>
                          <Typography variant="h5" fontWeight="900">{stat.value}</Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">Segment Dağılımı</Typography>
                      {segmentChartData.length > 0 && <PieChart series={[{ data: segmentChartData, innerRadius: 60 }]} width={400} height={300} />}
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}>
                      <Typography variant="h6" fontWeight="bold">Marka Kazançları (TL)</Typography>
                      <BarChart dataset={revenueByBrand} xAxis={[{ scaleType: 'band', dataKey: 'brand' }]} series={[{ dataKey: 'revenue', label: 'Ciro', color: '#9c27b0' }]} height={300} />
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell><strong>ID</strong></TableCell>
                        <TableCell><strong>Müşteri</strong></TableCell>
                        <TableCell><strong>Araç</strong></TableCell>
                        <TableCell><strong>Başlangıç</strong></TableCell>
                        <TableCell><strong>Bitiş</strong></TableCell>
                        <TableCell><strong>Fiyat</strong></TableCell>
                        <TableCell align="center"><strong>İşlemler</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((res) => (
                        <TableRow key={res.id} hover>
                          <TableCell>#{res.id}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">{res.customer_username}</Typography>
                            <Typography variant="caption" color="text.secondary">{res.customer_email}</Typography>
                          </TableCell>
                          <TableCell><strong>{res.car_details?.brand}</strong> {res.car_details?.model}</TableCell>
                          <TableCell>{res.start_date}</TableCell>
                          <TableCell>{res.end_date}</TableCell>
                          <TableCell><Chip label={`${res.total_price} TL`} color="primary" variant="outlined" size="small" /></TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => handleDeleteBooking(res.id)}><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {tabValue === 2 && (
              <Box>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" fontWeight="bold">Araç Envanteri</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} color="secondary" onClick={() => setOpenModal(true)}>Yeni Araç Ekle</Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell><strong>Görsel</strong></TableCell>
                        <TableCell><strong>Marka / Model</strong></TableCell>
                        <TableCell><strong>Plaka</strong></TableCell>
                        <TableCell><strong>Günlük Fiyat</strong></TableCell>
                        <TableCell align="center"><strong>Müsaitlik</strong></TableCell>
                        <TableCell align="right"><strong>İşlemler</strong></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {cars.map((car) => (
                        <TableRow key={car.id} hover>

                          <TableCell><img src={car.image} alt="car" style={{ width: 80, height: 50, objectFit: 'contain' }} /></TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">{car.brand}</Typography>
                            <Typography variant="body2">{car.model}</Typography>
                          </TableCell>
                        
                          <TableCell>{car.plate_number}</TableCell>
                        
                          <TableCell>{car.rent_per_day} TL</TableCell>
                        
                          <TableCell align="center">
                            <Switch checked={car.availability} onChange={() => handleToggleAvailability(car.id, car.availability)} color="success" />
                          </TableCell>
                        

                          <TableCell align="right">
                           
                            <IconButton color="primary" onClick={() => handleEditClick(car)}><EditIcon /></IconButton>
                           
                            <IconButton color="error" onClick={() => handleDeleteCar(car.id)}><DeleteIcon /></IconButton>
                          
                          </TableCell>
                        
                        
                        </TableRow>
                      ))}
                    </TableBody>
                  
                  </Table>
                </TableContainer>
                    
                <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                  <DialogTitle fontWeight="bold">
                    {isEditing ? 'Aracı Düzenle' : 'Yeni Araç Ekle'}                
                  </DialogTitle>
                        
                  <DialogContent dividers>
                    {/* 🎯 Üst Kısım: Marka, Model, Yıl, Plaka, Fiyat, Resim */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}><TextField fullWidth label="Marka" value={newCar.brand} onChange={(e) => setNewCar({...newCar, brand: e.target.value})} /></Grid>
                      <Grid size={{ xs: 6 }}><TextField fullWidth label="Model" value={newCar.model} onChange={(e) => setNewCar({...newCar, model: e.target.value})} /></Grid>
                      <Grid size={{ xs: 6 }}><TextField fullWidth label="Model Yılı" type="number" value={newCar.year} onChange={(e) => setNewCar({...newCar, year: e.target.value})} /></Grid>
                      <Grid size={{ xs: 6 }}><TextField fullWidth label="Plaka" value={newCar.plate_number} onChange={(e) => setNewCar({...newCar, plate_number: e.target.value})} /></Grid>
                      <Grid size={{ xs: 12 }}><TextField fullWidth label="Günlük Kiralama Ücreti" type="number" value={newCar.rent_per_day} onChange={(e) => setNewCar({...newCar, rent_per_day: e.target.value})} /></Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ border: '2px dashed grey', p: 2, textAlign: 'center', borderRadius: 2 }}>
                          {previewUrl && <img src={previewUrl} alt="Önizleme" style={{ width: '100%', maxHeight: 150, objectFit: 'contain', marginBottom: 10 }} />}
                          <Button component="label" variant="outlined" startIcon={<UploadIcon />}>Fotoğraf Seç <input type="file" hidden accept="image/*" onChange={handleFileChange} /></Button>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* 🎯 ORTA KISIM: 3'lü Seçiciler */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 2 }}>
                      <TextField
                        select
                        label="Segment"
                        value={newCar.segment || ''}
                        onChange={(e) => setNewCar({ ...newCar, segment: e.target.value })}
                        sx={{ flex: 1 }}
                        InputLabelProps={{ shrink: true }}
                      >
                        <MenuItem value="e">Ekonomi</MenuItem> 
                        <MenuItem value="c">Konfor</MenuItem>
                        <MenuItem value="p">Premium</MenuItem>
                        <MenuItem value="s">SUV</MenuItem>
                      </TextField>

                      <TextField
                        select
                        label="Vites"
                        value={newCar.gear || ''}
                        onChange={(e) => setNewCar({ ...newCar, gear: e.target.value })}
                        sx={{ flex: 1 }}
                        InputLabelProps={{ shrink: true }}
                      >
                        <MenuItem value="a">Otomatik</MenuItem>
                        <MenuItem value="m">Manuel</MenuItem>
                      </TextField>

                      <TextField
                        select
                        label="Yakıt"
                        value={newCar.fuel_type || ''}
                        onChange={(e) => setNewCar({ ...newCar, fuel_type: e.target.value })}
                        sx={{ flex: 1 }}
                        InputLabelProps={{ shrink: true }}
                      >
                        <MenuItem value="gasoline">Benzin</MenuItem>
                        <MenuItem value="diesel">Dizel</MenuItem>
                        <MenuItem value="hybrid">Hibrit</MenuItem>
                        <MenuItem value="electric">Elektrik</MenuItem>
                      </TextField>
                    </Box>

                    {/* ALT KISIM: Klima */}
                    <Box>
                      <FormControlLabel
                        control={<Checkbox checked={newCar.has_ac} onChange={(e) => setNewCar({ ...newCar, has_ac: e.target.checked })} color="primary" />}
                        label="Klima Mevcut"
                      />
                    </Box>
                  </DialogContent>

                  <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseModal}>İptal</Button>
                    <Button variant="contained" color="secondary" onClick={handleSaveCar}>
                      {isEditing ? 'Güncelle' : 'Kaydet'}
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default StaffDashboard;