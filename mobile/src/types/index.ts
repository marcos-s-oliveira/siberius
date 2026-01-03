export interface Tecnico {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  especialidade?: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  tecnico: Tecnico;
  usuario: Usuario;
  authType: string;
  expiresIn: string;
}

export interface OrdemServico {
  id: number;
  numeroOS: string;
  nomeCliente: string;
  nomeEvento: string;
  data: string;
  dataMontagem?: string;
  horarioMontagem?: string;
}

export interface Atendimento {
  id: number;
  dataAgendamento: string;
  status: string;
  observacoes?: string;
  finalizadoEm?: string;
}

export interface OrdemServicoItem {
  id: number;
  atendimentoId: number;
  funcao?: string;
  ordemServico: OrdemServico;
  atendimento: Atendimento;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Profile extends Tecnico {
  criadoEm: string;
  estatisticas: {
    totalAtendimentos: number;
    concluidos: number;
    emAndamento: number;
  };
}
