import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { login, clearError } from '../features/authSlice';
// import { GoogleLogin } from '@react-oauth/google';
import { useGoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../features/authSlice';
import { setNotification } from '../features/uiSlice';

// MUI Bileşenleri
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
  Divider,
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  EmailOutlined as EmailIcon
} from '@mui/icons-material';

function Login() {  
  const [email, setEmail] = useState(''); // Backend email bekliyor olabilir, kontrol et
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  // Eğer kullanıcı zaten giriş yapmışsa ana sayfaya gönder
  useEffect(() => {
    if (user) {
      navigate('/');
    }
    // Sayfa açıldığında eski hataları temizle
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  // 🎯 STANDART GİRİŞ (E-posta & Şifre)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // unwrap() sayesinde sunucu "OK" diyene kadar bekleriz ve hata varsa yakalayabiliriz
      await dispatch(login({ email, password })).unwrap(); // unwrap ile hataları yakalayabiliriz

      // navigate('/');
      
      // ✅ BAŞARI BİLDİRİMİ
      dispatch(setNotification({ 
        message: 'Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz...', 
        severity: 'success' 
      }));
      // Not: navigate zaten useEffect içindeki 'user' takibiyle otomatik yapılıyor.

    } catch (err) {
      // ❌ HATA BİLDİRİMİ
      // DRF genellikle "non_field_errors" içinde mesaj döner, ona göre mesajı alıyoruz
      const errorMsg = err?.non_field_errors?.[0] || err?.detail || 'E-posta veya şifre hatalı!';
      dispatch(setNotification({ 
        message: errorMsg, 
        severity: 'error' 
      }));
    }
  };

  // 🎯 GOOGLE LOGIN GÜNCELLEMESİ Login fonksiyonu
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await dispatch(googleLogin(tokenResponse.access_token)).unwrap();
        
        dispatch(setNotification({ 
          message: 'Google ile başarıyla giriş yapıldı.', 
          severity: 'success' 
        }));
      } catch (err) {
        // Google tarafında genellikle "detail" mesajı gelir
        const googleError = err?.detail || 'Google hesabınızla giriş yapılamadı.';
        
        dispatch(setNotification({ 
          message: googleError,
          severity: 'error' 
        }));
      }
    },
    onError: () => {
        dispatch(setNotification({ 
          message: 'Google yetkilendirme işlemi kullanıcı tarafından iptal edildi.',
          severity: 'error' 
        }));
    },
  });

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: 4, textAlign: 'center' }}>
          
          <Avatar sx={{ m: '0 auto 15px', bgcolor: 'primary.main', width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>

          <Typography component="h1" variant="h4" fontWeight="900" gutterBottom>
            Giriş Yap
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Yolculuğuna devam etmek için hesabına eriş.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              Kullanıcı adı veya şifre hatalı!
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-posta"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
            </Button>

            {/* Google Login Bölümü */}
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Divider sx={{ width: '100%' }}>veya</Divider>
      
              <Button
                fullWidth
                variant="outlined"
                startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="G" />}
                onClick={() => handleGoogleLogin()} // 🎯 Hook'u tetikliyoruz
                sx={{ py: 1.5, borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}
              >
                Google ile Giriş Yap
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Hesabın yok mu?{' '}
                <Link component={RouterLink} to="/register" fontWeight="bold" underline="hover">
                  Hemen Kayıt Ol
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;