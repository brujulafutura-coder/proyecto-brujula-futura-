/**
 * Brújula Futura — Contexto de Autenticación
 * Maneja el estado global de sesión (JWT + datos de usuario).
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage al montar
  useEffect(() => {
    const savedToken = localStorage.getItem('bf_token');
    const savedUser = localStorage.getItem('bf_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('bf_token', accessToken);
    localStorage.setItem('bf_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bf_token');
    localStorage.removeItem('bf_user');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
