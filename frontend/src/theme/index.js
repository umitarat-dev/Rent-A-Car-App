import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark', // Rent-a-car sitelerine karanlık mod çok yakışıyor
    primary: {
      main: '#e31b23', // "Hız" ve "Tutku"yu temsil eden bir kırmızı (Opsiyonel)
    },
    secondary: {
      main: '#ffffff',
    },
  },
});