import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/tecnicoService';
import { setAuthToken, getAuthToken, clearAuthToken, saveTecnicoData, getTecnicoData } from '../services/api';
import socketService from '../services/socketService';
import type { Tecnico, Usuario } from '../types';

interface AuthContextData {
  signed: boolean;
  loading: boolean;
  tecnico: Tecnico | null;
  usuario: Usuario | null;
  signIn: (qrToken: string, serverUrl?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tecnico, setTecnico] = useState<Tecnico | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      // Carregar e aplicar a URL do servidor salva
      const { getServerUrl, updateBaseUrl } = await import('../services/api');
      const savedUrl = await getServerUrl();
      if (savedUrl) {
        updateBaseUrl(savedUrl);
        console.log('URL do servidor carregada:', savedUrl);
      }
      
      const token = await getAuthToken();
      const tecnicoData = await getTecnicoData();

      if (token && tecnicoData) {
        setTecnico(tecnicoData.tecnico);
        setUsuario(tecnicoData.usuario);
        
        // Inicializar socket após carregar dados
        await socketService.initialize(tecnicoData.tecnico.id, tecnicoData.tecnico.nome);
        console.log('Socket inicializado para técnico:', tecnicoData.tecnico.nome);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(qrToken: string, serverUrl?: string) {
    try {
      // Se uma URL do servidor foi fornecida, salvar e atualizar a URL base da API
      if (serverUrl) {
        const { saveServerUrl, updateBaseUrl } = await import('../services/api');
        await saveServerUrl(serverUrl);
        updateBaseUrl(serverUrl);
        console.log('URL do servidor salva:', serverUrl);
      }
      
      console.log('Iniciando login com token:', qrToken.substring(0, 20) + '...');
      const response = await authService.loginMobile(qrToken);
      
      console.log('Resposta do servidor recebida');
      console.log('Token JWT:', response.token?.substring(0, 20) + '...');
      console.log('Técnico:', response.tecnico?.nome);

      await setAuthToken(response.token);
      await saveTecnicoData({
        tecnico: response.tecnico,
        usuario: response.usuario,
      });

      setTecnico(response.tecnico);
      setUsuario(response.usuario);
      
      // Inicializar socket após login
      await socketService.initialize(response.tecnico.id, response.tecnico.nome);
      console.log('Socket inicializado após login para:', response.tecnico.nome);
      
      console.log('Login concluído com sucesso');
    } catch (error: any) {
      console.error('Erro no signIn:', error);
      console.error('Resposta:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Erro ao fazer login');
    }
  }

  async function signOut() {
    // Desconectar socket antes de fazer logout
    socketService.disconnect();
    
    await clearAuthToken();
    setTecnico(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!tecnico,
        loading,
        tecnico,
        usuario,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
