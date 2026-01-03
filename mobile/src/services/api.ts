import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Configurar a URL base da API
// IMPORTANTE: Substitua pelo IP local do seu computador onde o backend está rodando
// Para descobrir seu IP: Windows (ipconfig), Mac/Linux (ifconfig)
const API_BASE_URL = 'http://192.168.100.101:3000';

console.log('API Base URL configurada:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token adicionado ao header');
    } else {
      console.log('Nenhum token encontrado no SecureStore');
    }
    console.log(`Requisição: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => {
    console.log(`Resposta: ${response.status} - ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    console.error('Erro na resposta da API:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    if (error.response?.status === 401) {
      console.log('Token inválido/expirado - limpando dados');
      // Token inválido ou expirado - fazer logout
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('tecnicoData');
    }
    return Promise.reject(error);
  }
);

export default api;

export const setAuthToken = async (token: string) => {
  await SecureStore.setItemAsync('authToken', token);
};

export const getAuthToken = async () => {
  return await SecureStore.getItemAsync('authToken');
};

export const clearAuthToken = async () => {
  await SecureStore.deleteItemAsync('authToken');
  await SecureStore.deleteItemAsync('tecnicoData');
};

export const saveTecnicoData = async (data: any) => {
  await SecureStore.setItemAsync('tecnicoData', JSON.stringify(data));
};

export const getTecnicoData = async () => {
  const data = await SecureStore.getItemAsync('tecnicoData');
  return data ? JSON.parse(data) : null;
};

export const saveServerUrl = async (url: string) => {
  await SecureStore.setItemAsync('serverUrl', url);
};

export const getServerUrl = async () => {
  return await SecureStore.getItemAsync('serverUrl');
};

export const updateBaseUrl = (newUrl: string) => {
  api.defaults.baseURL = newUrl;
  console.log('URL base atualizada para:', newUrl);
};
