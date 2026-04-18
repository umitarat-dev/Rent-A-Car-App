import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { registerUser, clearError } from '../features/authSlice';
import { setNotification } from '../features/uiSlice';

// MUI Bileşenleri
import {
  Container, Box, Typography, TextField, Button, Paper, Avatar,
  Alert, InputAdornment, IconButton, CircularProgress, Link, Grid
} from '@mui/material';
import {
  PersonAddOutlined as RegisterIcon,
  Visibility, VisibilityOff,
  EmailOutlined as EmailIcon,
  PersonOutline as UserIcon,
  LockOutlined as LockIcon
} from '@mui/icons-material';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  // Başarılı kayıt sonrası ana sayfaya uçur
  useEffect(() => {
    if (user) { navigate('/'); }
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError) setLocalError(null); // Yazmaya başlayınca hatayı temizle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basit Validasyon: Şifre eşleşme kontrolü
    if (formData.password !== formData.password2) {
      setLocalError("Şifreler birbiriyle eşleşmiyor!");
      return;
    }

    try {
      // 🚀 unwrap() ile kayıt işleminin bitmesini bekle
      await dispatch(registerUser(formData)).unwrap();

      dispatch(setNotification({ 
        message: 'Hesabınız başarıyla oluşturuldu! Aramıza hoş geldiniz.', 
        severity: 'success' 
      }));
    } catch (err) {
      // Hatalar zaten formun üstündeki Alert'te görünüyor 
      // ama genel bir toast da fırlatabiliriz:
      // 🎯 Backend'den gelen spesifik hata mesajını yakalayalım
      // Django genelde hatayı bir nesne içinde gönderir (örn: { detail: "Hata mesajı" })
      let msg = 'Bir sorun oluştu.';
  
      if (typeof err === 'object') {
        // Nesne içindeki ilk hata mesajını al (Örn: email hatası)
        const firstKey = Object.keys(err)[0];
        msg = `${firstKey}: ${err[firstKey][0]}`;
      } else if (typeof err === 'string') {
        msg = err;
      }

      dispatch(setNotification({ message: msg, severity: 'error' }));
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, width: '100%', borderRadius: 4, textAlign: 'center',
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider'
          }}
        >
          <Avatar sx={{ m: '0 auto 15px', bgcolor: 'secondary.main', width: 56, height: 56 }}>
            <RegisterIcon fontSize="large" />
          </Avatar>

          <Typography component="h1" variant="h4" fontWeight="900" gutterBottom color="text.primary">
            Kayıt Ol
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hemen aramıza katıl ve en iyi araçları kiralamaya başla.
          </Typography>

          {/* Backend veya Frontend Hata Mesajları */}
          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, textAlign: 'left' }}>
              {localError || (typeof error === 'object' ? 'Lütfen bilgileri kontrol edin.' : error)}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required fullWidth name="username" label="Kullanıcı Adı"
                  value={formData.username} onChange={handleChange}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><UserIcon color="action" /></InputAdornment>) }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required fullWidth name="email" label="E-posta" type="email"
                  value={formData.email} onChange={handleChange}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>) }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required fullWidth name="password" label="Şifre"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange}
                  InputProps={{ 
                    startAdornment: (<InputAdornment position="start"><LockIcon color="action" /></InputAdornment>),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required fullWidth name="password2" label="Şifre Tekrar"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password2} onChange={handleChange}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon color="action" /></InputAdornment>) }}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading}
              sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Hesap Oluştur'}
            </Button>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.primary">
                Zaten hesabın var mı?{' '}
                <Link component={RouterLink} to="/login" fontWeight="bold" underline="hover" color="primary">
                  Giriş Yap
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;