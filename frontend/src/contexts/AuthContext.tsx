import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { Usuario } from '../types';

interface AuthContextType {
  user: Usuario | null;
  authType: 'full' | 'pin' | null;
  token: string | null;
  loginWithPin: (usuarioId: number, pin: string) => Promise<void>;
  loginWithPassword: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasFullAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [authType, setAuthType] = useState<'full' | 'pin' | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Carregar token do localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedAuthType = localStorage.getItem('authType') as 'full' | 'pin' | null;

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setAuthType(storedAuthType);
    }
  }, []);

  const loginWithPin = async (usuarioId: number, pin: string) => {
    const response = await authAPI.loginPin(usuarioId, pin);
    const { token, usuario, authType } = response.data;

    setToken(token);
    setUser(usuario);
    setAuthType(authType);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(usuario));
    localStorage.setItem('authType', authType);
  };

  const loginWithPassword = async (email: string, senha: string) => {
    const response = await authAPI.loginComplete(email, senha);
    const { token, usuario, authType } = response.data;

    setToken(token);
    setUser(usuario);
    setAuthType(authType);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(usuario));
    localStorage.setItem('authType', authType);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthType(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authType');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authType,
        token,
        loginWithPin,
        loginWithPassword,
        logout,
        isAuthenticated: !!token,
        hasFullAuth: authType === 'full',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
