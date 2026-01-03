import axios from 'axios';
import type { OrdemServico, Atendimento, AuthResponse, Tecnico, Usuario } from '../types';

// Usar config.js se disponível, senão fallback para env vars e localhost
const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.SIBERIUS_CONFIG) {
    return window.SIBERIUS_CONFIG.API_URL;
  }
  return (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000';
};

const getApiTimeout = () => {
  if (typeof window !== 'undefined' && window.SIBERIUS_CONFIG) {
    return window.SIBERIUS_CONFIG.API_TIMEOUT || 10000;
  }
  return 10000;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: getApiTimeout(),
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Tempo de espera esgotado. O servidor está demorando para responder.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      error.userMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
    } else {
      const status = error.response?.status;
      const messages: Record<number, string> = {
        400: 'Requisição inválida. Verifique os dados enviados.',
        401: 'Não autorizado. Faça login novamente.',
        403: 'Acesso negado. Você não tem permissão para esta ação.',
        404: 'Recurso não encontrado.',
        500: 'Erro interno do servidor. Tente novamente mais tarde.',
        503: 'Serviço temporariamente indisponível.',
      };
      error.userMessage = messages[status] || `Erro ${status}: ${error.response?.data?.message || 'Erro desconhecido'}`;
    }
    return Promise.reject(error);
  }
);

// Verificar conexão com o servidor
export const checkServerConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  try {
    await api.get('/health', { timeout: 5000 });
    return { connected: true };
  } catch (error: any) {
    return { 
      connected: false, 
      error: error.userMessage || 'Servidor offline'
    };
  }
};

export const ordensServicoAPI = {
  getAll: () => api.get<OrdemServico[]>('/api/ordens-servico'),
  getByNumero: (numero: string) => api.get<OrdemServico[]>(`/api/ordens-servico/numero/${numero}`),
  getById: (id: number) => api.get<OrdemServico>(`/api/ordens-servico/${id}`),
  update: (id: number, data: Partial<OrdemServico>) => api.put<OrdemServico>(`/api/ordens-servico/${id}`, data),
  getPdfUrl: (id: number) => `${API_URL}/api/ordens-servico/${id}/pdf`,
};

export const atendimentosAPI = {
  getAll: () => api.get<Atendimento[]>('/api/atendimentos'),
  getById: (id: number) => api.get<Atendimento>(`/api/atendimentos/${id}`),
  getByOS: (osId: number) => api.get<Atendimento>(`/api/atendimentos/os/${osId}`),
  create: (data: Partial<Atendimento>) => api.post<Atendimento>('/api/atendimentos', data),
  update: (id: number, data: Partial<Atendimento>) => api.put<Atendimento>(`/api/atendimentos/${id}`, data),
  updateStatus: (id: number, status: string) => api.patch<Atendimento>(`/api/atendimentos/${id}/status`, { status }),
  addTecnico: (id: number, tecnicoId: number, funcao?: string) => api.post<Atendimento>(`/api/atendimentos/${id}/tecnicos`, { tecnicoId, funcao }),
  removeTecnico: (id: number, tecnicoId: number) => api.delete<Atendimento>(`/api/atendimentos/${id}/tecnicos/${tecnicoId}`),
  delete: (id: number) => api.delete(`/api/atendimentos/${id}`),
  stats: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/api/atendimentos/stats?${params.toString()}`);
  }
};

export const tecnicosAPI = {
  getAll: () => api.get<Tecnico[]>('/api/tecnicos'),
  getById: (id: number) => api.get<Tecnico>(`/api/tecnicos/${id}`),
  create: (data: Partial<Tecnico>) => api.post<Tecnico>('/api/tecnicos', data),
  update: (id: number, data: Partial<Tecnico>) => api.put<Tecnico>(`/api/tecnicos/${id}`, data),
  delete: (id: number) => api.delete(`/api/tecnicos/${id}`),
  generateMobileToken: (id: number) => api.post<{ qrData: string; message: string }>(`/api/tecnicos/${id}/generate-token`),
};

export const authAPI = {
  loginPin: (usuarioId: number, pin: string) => 
    api.post<AuthResponse>('/auth/login/pin', { usuarioId, pin }),
  loginComplete: (email: string, senha: string) =>
    api.post<AuthResponse>('/auth/login', { email, senha }),
  getUsuarios: () => api.get<Array<{ id: number; nome: string }>>('/auth/usuarios'),
  getUsuariosFull: () => api.get<Array<Usuario>>('/auth/usuarios/full'),
  createUsuario: (data: Partial<Usuario>) => api.post<Usuario>('/auth/usuarios', data),
  updateUsuario: (id: number, data: Partial<Usuario>) => api.put<Usuario>(`/auth/usuarios/${id}`, data),
  deleteUsuario: (id: number) => api.delete(`/auth/usuarios/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  getOSByMonth: () => api.get('/api/dashboard/os-by-month'),
  getOSvsAtendimentos: () => api.get('/api/dashboard/os-vs-atendimentos'),
  getWeeklyAverage: () => api.get('/api/dashboard/weekly-average'),
  getTecnicoRanking: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/api/dashboard/tecnico-ranking${params.toString() ? '?' + params.toString() : ''}`);
  },
  getTecnicosByEspecialidade: () => api.get('/api/dashboard/tecnicos-by-especialidade'),
  getUpcomingEvents: () => api.get('/api/dashboard/upcoming-events'),
};

export default api;
