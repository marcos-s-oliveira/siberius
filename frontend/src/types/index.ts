export interface OrdemServico {
  id: number;
  numeroOS: string;
  versao: number;
  nomeCliente: string;
  nomeEvento: string;
  data: string;
  osAtualizada: boolean;
  caminhoArquivo: string;
  caminhoRelativo?: string;
  nomeArquivo: string;
  ativa: boolean;
  atendimento?: Atendimento;
}

export interface Tecnico {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  especialidade?: string;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface TecnicoAtendimento {
  id: number;
  atendimentoId: number;
  tecnicoId: number;
  funcao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  tecnico?: Tecnico;
}

export interface Atendimento {
  id: number;
  ordemServicoId: number;
  dataAgendamento: string;
  status: 'nao_agendado' | 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  ordemServico?: OrdemServico;
  tecnicos?: TecnicoAtendimento[];
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  pin?: string;
  ativo: boolean;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
  authType: 'full' | 'pin';
  expiresIn: string;
}
