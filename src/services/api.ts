import axios from 'axios';
import { getToken } from '../utils/storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las solicitudes
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  console.log('Token en interceptor:', token); // Depuración
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No se encontró token en storage');
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en solicitud:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;