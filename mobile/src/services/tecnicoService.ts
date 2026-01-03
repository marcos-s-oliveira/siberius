import api from './api';
import type { AuthResponse, OrdemServicoItem, PaginatedResponse, Profile } from '../types';

export const authService = {
  loginMobile: async (token: string): Promise<AuthResponse> => {
    console.log('Fazendo requisição POST para /auth/login/mobile');
    console.log('Token enviado:', token.substring(0, 20) + '...');
    const response = await api.post<AuthResponse>('/auth/login/mobile', { token });
    console.log('Status da resposta:', response.status);
    return response.data;
  },
};

export const tecnicoService = {
  getMyOrdens: async (
    page: number = 1,
    limit: number = 10,
    status?: string,
    orderBy: string = 'dataAgendamento',
    order: 'asc' | 'desc' = 'asc'
  ): Promise<PaginatedResponse<OrdemServicoItem>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      orderBy,
      order,
    });
    if (status) {
      params.append('status', status);
    }
    const response = await api.get<PaginatedResponse<OrdemServicoItem>>(
      `/api/tecnicos/mobile/ordens?${params.toString()}`
    );
    return response.data;
  },

  acceptOrdem: async (atendimentoId: number): Promise<{ success: boolean }> => {
    const response = await api.post('/api/tecnicos/mobile/accept', { atendimentoId });
    return response.data;
  },

  finishOrdem: async (atendimentoId: number, observacoes?: string): Promise<{ success: boolean }> => {
    const response = await api.post('/api/tecnicos/mobile/finish', { atendimentoId, observacoes });
    return response.data;
  },

  getHistory: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<OrdemServicoItem>> => {
    const response = await api.get<PaginatedResponse<OrdemServicoItem>>(
      `/api/tecnicos/mobile/history?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getProfile: async (): Promise<Profile> => {
    const response = await api.get<Profile>('/api/tecnicos/mobile/profile');
    return response.data;
  },
};
