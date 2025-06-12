import React, { createContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken } from '../utils/storage';
import api from '../services/api';
import { useIonRouter } from '@ionic/react';

interface AuthContextType {
  token: string | null;
  nombre: string | null;
  isAuthenticated: boolean;
  login: (usuario: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  nombre: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useIonRouter();

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await getToken();
      console.log('Token al cargar app:', storedToken); // Depuración
      if (storedToken) {
        setTokenState(storedToken);
        setIsAuthenticated(true);
      }
    };
    loadToken();
  }, []);

  const login = async (usuario: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { usuario, password });
      const { token, nombre } = response.data;
      console.log('Login exitoso, token:', token, 'nombre:', nombre); // Depuración
      await setToken(token);
      setTokenState(token);
      setNombre(nombre);
      setIsAuthenticated(true);
      router.push('/tabs/tab1', 'forward', 'replace');
    } catch (error: any) {
      console.error('Error en login:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  const logout = async () => {
    try {
      const currentToken = await getToken();
      console.log('Token antes de logout:', currentToken); // Depuración
      if (!currentToken) {
        console.warn('No hay token para logout');
      }
      await api.post('/auth/logout');
      await removeToken();
      setTokenState(null);
      setNombre(null);
      setIsAuthenticated(false);
      router.push('/login', 'root', 'replace');
    } catch (error: any) {
      console.error('Error en logout:', error.response?.data || error.message);
      // Limpiar estado incluso si el backend falla
      await removeToken();
      setTokenState(null);
      setNombre(null);
      setIsAuthenticated(false);
      router.push('/login', 'root', 'replace');
    }
  };

  return (
    <AuthContext.Provider value={{ token, nombre, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};