import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotification } from '../features/uiSlice';

// 🎯 Bildirimin yukarıdan aşağıya tatlıca kayması için animasyon fonksiyonu
function TransitionDown(props) {
  return <Slide {...props} direction="down" />;
}
const Notification = () => {
  const dispatch = useDispatch();
  const { notification } = useSelector((state) => state.ui);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    dispatch(clearNotification());
  };

  return (
    <Snackbar 
      open={notification.open} 
      autoHideDuration={4000} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Sağ üst köşe
      // 🎯 Animasyonu yukarıdan aşağıya yaptık
      TransitionComponent={TransitionDown}
      // 🎯 Navbar'ın altında durması için boşluk ekliyoruz
      sx={{ 
        marginTop: '70px', // Navbar yüksekliğine göre (genelde 64-70px arasıdır)
        marginRight: '20px'
      }}
    >
      <Alert 
        onClose={handleClose} 
        severity={notification.severity} 
        variant="filled"
        sx={{ 
            width: '100%', 
            borderRadius: 3, 
            fontWeight: 'bold', 
            // Dark mode'da bile patlamayan soft bir gölge
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;