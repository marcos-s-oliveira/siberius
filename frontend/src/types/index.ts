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
  atendimentos?: Atendimento[];
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

export interface Atendimento {
  id: number;
  ordemServicoId: number;
  tecnicoId: number;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
  tecnico?: Tecnico;
  ordemServico?: OrdemServico;
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
  expiresIn: string;
}
