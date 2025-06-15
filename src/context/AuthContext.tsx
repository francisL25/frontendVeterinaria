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
    const loadSession = async () => {
      const storedToken = await getToken();
      const storedNombre = localStorage.getItem('nombre'); // 👈 cargar nombre

      console.log('Token al cargar app:', storedToken);
      if (storedToken) {
        setTokenState(storedToken);
        setIsAuthenticated(true);
      }

      if (storedNombre) {
        setNombre(storedNombre); // 👈 establecer nombre
      }
    };
    loadSession();
  }, []);

  const login = async (usuario: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { usuario, password });
      const { token, nombre } = response.data;
      console.log('Login exitoso, token:', token, 'nombre:', nombre);

      await setToken(token);
      localStorage.setItem('nombre', nombre); // 👈 guardar nombre

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
      console.log('Token antes de logout:', currentToken);

      if (!currentToken) {
        console.warn('No hay token para logout');
      }

      await api.post('/auth/logout');
    } catch (error: any) {
      console.error('Error en logout:', error.response?.data || error.message);
    } finally {
      await removeToken();
      localStorage.removeItem('nombre'); // 👈 borrar nombre

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
