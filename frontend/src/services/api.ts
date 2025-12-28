import axios from 'axios';
import type { OrdemServico, Atendimento, AuthResponse, Tecnico } from '../types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos
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
  getByOrdemServico: (osId: number) => api.get<Atendimento[]>(`/api/atendimentos/ordem-servico/${osId}`),
  getByTecnico: (tecnicoId: number) => api.get<Atendimento[]>(`/api/atendimentos/tecnico/${tecnicoId}`),
  create: (data: Partial<Atendimento>) => api.post<Atendimento>('/api/atendimentos', data),
  update: (id: number, data: Partial<Atendimento>) => api.put<Atendimento>(`/api/atendimentos/${id}`, data),
  delete: (id: number) => api.delete(`/api/atendimentos/${id}`),
};

export const tecnicosAPI = {
  getAll: () => api.get<Tecnico[]>('/api/tecnicos'),
  getById: (id: number) => api.get<Tecnico>(`/api/tecnicos/${id}`),
};

export const authAPI = {
  loginPin: (usuarioId: number, pin: string) => 
    api.post<AuthResponse>('/auth/login/pin', { usuarioId, pin }),
  getUsuarios: () => api.get<Array<{ id: number; nome: string }>>('/auth/usuarios'),
};

export default api;
