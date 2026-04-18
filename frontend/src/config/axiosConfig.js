import axios from 'axios';

// Vite otomatik olarak ortamı algılar ve doğru URL'i çeker
const API_BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// İhtiyaç duyarsan interceptor ekleyerek her isteğe 
// otomatik olarak Token da ekleyebilirsin
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.url.includes('auth/login') && !config.url.includes('register')) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default axiosInstance;