import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice'; // Güncellenmiş yol
import { setNotification } from '../../features/uiSlice';

// MUI Bileşenleri
import {
  AppBar, Box, Toolbar, Typography, Container, IconButton,
  Menu, MenuItem, Avatar, Divider, ListItemIcon, Tooltip, Stack
} from '@mui/material';

// İkonlar
import {
  DirectionsCar as CarIcon,
  Logout as LogoutIcon,
  AppRegistration as RegisterIcon,
  Login as LoginIcon,
  Brightness4 as DarkModeIcon, // Ay ikonu (Karanlık)
  Brightness7 as LightModeIcon, // Güneş ikonu (Aydınlık)
  AccountCircle as AccountIcon,
  KeyboardArrowDown as ArrowIcon,
  ListAlt as ListAltIcon,
  Dashboard as AdminIcon, // 🎯 Yönetim Paneli için ikon
} from '@mui/icons-material';

function Navbar({ mode, toggleTheme }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    handleCloseMenu(); // Menüyü kapat
  
    // 1. Redux'taki kullanıcı verilerini ve token'ı temizle
    dispatch(logout());
  
    // 🎯 2. BİLDİRİMİ PATLAT: Sağ üstten "Güle güle" diyelim
    dispatch(setNotification({ 
    message: 'Başarıyla çıkış yapıldı. Tekrar görüşmek üzere! 👋', 
    severity: 'success' 
    }));

    // 3. Kullanıcıyı yönlendir
    // (Tavsiyem: /login yerine / (ana sayfa) daha şık olur ama senin tercihin!)    
    navigate('/');
  };

  const handleMyReservations = () => {
    // handleMenuClose(); // Menüyü kapat
    handleCloseMenu(); // Menü kapatma fonksiyonunu çağır
    navigate('/my-reservations'); // Sayfaya yönlendir
  };

  const handleAdminDashboard = () => {
  handleCloseMenu();
  navigate('/staff-dashboard'); // 🚀 Yönetim sayfasına uçurur
  };

  // Kullanıcı e-postasının ilk iki harfini al (Güvenli kontrol ile)
  const getEmailInitials = () => {
    if (user && user.email) {
    // E-postanın ilk iki karakterini alıyoruz (Örn: umit@... -> UM)
    return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  // console.log("Mevcut Kullanıcı Verisi:", user);

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: mode === 'light' ? '#e6e7e7' : 'background.paper',
        color: 'text.primary',  // Yazı rengini otomatik ayarlar
        borderBottom: '1px solid',
        borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease' // Renk geçişi yumuşak olsun
        }} 
        elevation={mode === 'light' ? 1 : 0} // Aydınlık modda hafif gölge ile derinlik kat
        >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>

          {/* --- LOGO - color: 'inherit' yaparak AppBar'ın rengini almasını sağladık--- */}
          <Stack 
            direction="row" 
            alignItems="center" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit' 
            }}>
            <CarIcon sx={{ mr: 1, color: 'primary.main', fontSize: 30, }} />
            <Typography 
              variant="h6" 
              fontWeight="900" 
              sx={{ letterSpacing: '0.5px'}}
            >
              RENT-A-CAR
            </Typography>
          </Stack>

          {/* --- MODERN TOGGLE MENU --- */}
          <Box>
            <Tooltip title="Hesap ve Ayarlar">

              <IconButton 
                onClick={handleOpenMenu} 
                sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  border: '1px solid',
                  borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
                  color: 'text.primary', 
                  gap: 1,
                  '&:hover': { bgcolor: mode === 'light' ? '#f5f5f5' : '#252525' }
                }}
              >
                {user ? (
                  /* 1. Kural: E-posta baş harfleri */
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 13, fontWeight: 'bold' }}>
                    {getEmailInitials()}
                  </Avatar>
                ) : (
                  /* 1. Kural: Anonymous icon */
                  <AccountIcon />
                )}
                <ArrowIcon 
                  fontSize="small" 
                  sx={{ 
                    opacity: 0.6, 
                    // color: 'text.primary'
                  }} />
              </IconButton>

            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              PaperProps={{
                elevation: 8, // Menüye güçlü bir gölge vererek sayfadan yukarı kaldır
                sx: { 
                  mt: 1.5, 
                  width: 220, 
                  borderRadius: 3, 
                  bgcolor: 'background.paper', // 👈 Temaya uyumlu yapıldı
                  color: 'text.primary',       // 👈 Yazılar görünür oldu
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0px 10px 25px rgba(0,0,0,0.1)'
                }
              }}
            >
              <MenuItem 
                onClick={() => { toggleTheme(); handleCloseMenu(); }} 
                // sx={{ borderRadius: 2 }}
              >
                <ListItemIcon>
                  {mode === 'dark' ? (
                  <LightModeIcon fontSize="small" sx={{ color: 'orange' }} /> 
                  ):(
                  <DarkModeIcon fontSize="small" sx={{ color: '#1a237e' }} /> 
                  )}
                </ListItemIcon>
                {mode === 'dark' ? 
                   
                  <Typography variant="body1" fontWeight="600">Aydınlık Mod</Typography>
                  : 
                  <Typography variant="body1" fontWeight="600">Karanlık Mod</Typography>
                }
              </MenuItem>
              
              <Divider sx={{ bgcolor: '#444' }} />

              {/* --- 🛡️ Sadece Staff/Admin ise Yönetim Paneli Linkini Göster --- */}
              {user?.is_staff && [
              <MenuItem key="admin-link" onClick={handleAdminDashboard} sx={{ color: 'secondary.main' }}>
                <ListItemIcon>
                  <AdminIcon fontSize="small" color="secondary" />
                </ListItemIcon>
                <Typography variant="body1" fontWeight="900">
                  Yönetim Paneli
                </Typography>
              </MenuItem>,
              <Divider key="admin-divider" sx={{ opacity: 0.6 }} />
              ]}              

              <MenuItem onClick={handleMyReservations}>
                <ListItemIcon>
                  <ListAltIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <Typography variant="body1" fontWeight="600">
                  Rezervasyonlarım
                </Typography>
              </MenuItem>

              {user ? (
                /* --- 2b: AUTHENTICATED USER --- */
                <MenuItem 
                  onClick={handleLogout} 
                  sx={{ color: 'error.main' }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <Typography variant="body1" fontWeight="600">Çıkış Yap</Typography>
                </MenuItem>
              ) : (
                /* --- 2a: ANONYMOUS USER --- */
                <Box>
                  <MenuItem 
                    onClick={handleCloseMenu} 
                    component={RouterLink} 
                    to="/login"
                  >
                    <ListItemIcon>
                      <LoginIcon fontSize="small" sx={{ color: 'inherit' }} />
                    </ListItemIcon>
                    <Typography variant="body1" fontWeight="600">Giriş Yap</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleCloseMenu} 
                    component={RouterLink} 
                    to="/register"
                  >
                    <ListItemIcon>
                      <RegisterIcon fontSize="small" sx={{ color: 'inherit' }} />
                    </ListItemIcon>
                    <Typography variant="body1" fontWeight="600">Kayıt Ol</Typography>
                  </MenuItem>
                </Box>
              )}
            </Menu>
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;