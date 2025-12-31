import { useState } from 'react';
import './UserManual.css';
import React from 'react';

interface Section {
  id: string;
  title: string;
  icon: string;
  content: React.ReactElement;
}

function UserManual() {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const sections: Section[] = [
    {
      id: 'intro',
      title: 'Introdução',
      icon: '📖',
      content: (
        <div className="manual-section">
          <h2>Bem-vindo ao Sistema Siberius</h2>
          <p className="lead">
            O Siberius é um sistema completo de gestão de ordens de serviço e atendimentos,
            desenvolvido para facilitar o gerenciamento de eventos, técnicos e agendamentos.
          </p>
          
          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3>Dashboard Inteligente</h3>
              <p>Visualize estatísticas em tempo real com gráficos interativos</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📋</span>
              <h3>Ordens de Serviço</h3>
              <p>Gerencie OS importadas automaticamente de PDFs</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">👨‍🔧</span>
              <h3>Gestão de Técnicos</h3>
              <p>Cadastre e organize técnicos por especialidades</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎯</span>
              <h3>Atendimentos</h3>
              <p>Agende e acompanhe atendimentos de OS</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">👥</span>
              <h3>Usuários</h3>
              <p>Gerencie usuários com autenticação segura</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔄</span>
              <h3>Sincronização</h3>
              <p>Importação automática de PDFs em tempo real</p>
            </div>
          </div>

          <div className="info-box">
            <span className="info-icon">💡</span>
            <div>
              <strong>Dica:</strong> Use a barra lateral para navegar entre as diferentes seções
              deste manual e encontrar informações específicas sobre cada funcionalidade.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'login',
      title: 'Login e Autenticação',
      icon: '🔐',
      content: (
        <div className="manual-section">
          <h2>Login e Autenticação</h2>
          
          <h3>Formas de Login</h3>
          <p>O sistema oferece duas formas de autenticação:</p>

          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Login Completo (Email e Senha)</h4>
              <p>Para acesso administrativo completo:</p>
              <ul>
                <li>Digite seu email cadastrado</li>
                <li>Digite sua senha</li>
                <li>Clique em "Entrar"</li>
              </ul>
              <div className="warning-box">
                <span className="warning-icon">⚠️</span>
                <div>
                  <strong>Segurança:</strong> Mantenha suas credenciais em segurança e não compartilhe com terceiros.
                </div>
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Login com PIN (Touch Screen)</h4>
              <p>Para acesso rápido em dispositivos touch:</p>
              <ul>
                <li>Selecione seu nome na lista de usuários</li>
                <li>Digite seu PIN de 4 dígitos</li>
                <li>Pressione "Confirmar"</li>
              </ul>
              <div className="info-box">
                <span className="info-icon">💡</span>
                <div>
                  <strong>Ideal para:</strong> Tablets e totens touch screen em eventos,
                  permitindo login rápido de técnicos no local.
                </div>
              </div>
            </div>
          </div>

          <h3>Sessão e Segurança</h3>
          <ul>
            <li>Sua sessão expira automaticamente após um período de inatividade</li>
            <li>Você será deslogado automaticamente por segurança</li>
            <li>Todas as operações são realizadas de forma segura</li>
          </ul>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊',
      content: (
        <div className="manual-section">
          <h2>Dashboard - Visão Geral</h2>
          <p>O dashboard é sua central de informações, exibindo estatísticas e métricas em tempo real.</p>

          <h3>Cards de Estatísticas</h3>
          <p>No topo, você encontra 4 cards com totalizadores:</p>
          <div className="metric-grid">
            <div className="metric-item">
              <span className="metric-icon">📋</span>
              <strong>Total de OS:</strong> Ordens de serviço ativas
            </div>
            <div className="metric-item">
              <span className="metric-icon">👨‍🔧</span>
              <strong>Técnicos:</strong> Técnicos ativos no sistema
            </div>
            <div className="metric-item">
              <span className="metric-icon">🎯</span>
              <strong>Atendimentos:</strong> Total de agendamentos
            </div>
            <div className="metric-item">
              <span className="metric-icon">👥</span>
              <strong>Usuários:</strong> Usuários cadastrados
            </div>
          </div>

          <h3>Gráficos e Visualizações</h3>
          
          <div className="expandable-item">
            <button 
              className="expand-header"
              onClick={() => toggleExpand('chart-os-month')}
            >
              <span className="expand-icon">{expandedItems.has('chart-os-month') ? '▼' : '▶'}</span>
              <strong>OS por Mês</strong>
            </button>
            {expandedItems.has('chart-os-month') && (
              <div className="expand-content">
                <p>Gráfico de barras mostrando a distribuição de ordens de serviço nos últimos 12 meses.</p>
                <ul>
                  <li><strong>Tipo:</strong> Gráfico de barras vertical</li>
                  <li><strong>Período:</strong> Últimos 12 meses</li>
                  <li><strong>Uso:</strong> Identificar sazonalidade e tendências</li>
                </ul>
              </div>
            )}
          </div>

          <div className="expandable-item">
            <button 
              className="expand-header"
              onClick={() => toggleExpand('chart-weekly')}
            >
              <span className="expand-icon">{expandedItems.has('chart-weekly') ? '▼' : '▶'}</span>
              <strong>Média Semanal de Eventos</strong>
            </button>
            {expandedItems.has('chart-weekly') && (
              <div className="expand-content">
                <p>Gráfico de linha mostrando a média de eventos por semana.</p>
                <ul>
                  <li><strong>Tipo:</strong> Gráfico de linha</li>
                  <li><strong>Período:</strong> Últimas 8 semanas</li>
                  <li><strong>Uso:</strong> Acompanhar volume de trabalho semanal</li>
                </ul>
              </div>
            )}
          </div>

          <div className="expandable-item">
            <button 
              className="expand-header"
              onClick={() => toggleExpand('chart-status')}
            >
              <span className="expand-icon">{expandedItems.has('chart-status') ? '▼' : '▶'}</span>
              <strong>Status dos Atendimentos</strong>
            </button>
            {expandedItems.has('chart-status') && (
              <div className="expand-content">
                <p>Pizza mostrando a distribuição de status dos atendimentos.</p>
                <ul>
                  <li><strong>Pendentes:</strong> Aguardando execução</li>
                  <li><strong>Em Andamento:</strong> Sendo executados</li>
                  <li><strong>Concluídos:</strong> Finalizados com sucesso</li>
                </ul>
              </div>
            )}
          </div>

          <h3>Ranking de Técnicos</h3>
          <p>Visualize os 10 técnicos com mais atendimentos, com opções de período:</p>
          <ul>
            <li><strong>Últimos 30 dias</strong> (padrão)</li>
            <li><strong>Este mês:</strong> Do dia 1 até hoje</li>
            <li><strong>Personalizado:</strong> Escolha data inicial e final</li>
          </ul>
          <div className="info-box">
            <span className="info-icon">💡</span>
            <div>
              <strong>Dica:</strong> Use o filtro de período para avaliar performance em diferentes
              períodos e identificar técnicos mais produtivos.
            </div>
          </div>

          <h3>Eventos Próximos</h3>
          <p>Cards exibindo ordens de serviço dos próximos 7 dias, facilitando o planejamento.</p>
        </div>
      )
    },
    {
      id: 'ordens',
      title: 'Ordens de Serviço',
      icon: '📋',
      content: (
        <div className="manual-section">
          <h2>Gestão de Ordens de Serviço</h2>
          <p>As ordens de serviço são o coração do sistema, representando eventos e trabalhos a serem realizados.</p>

          <h3>Importação Automática</h3>
          <div className="info-box">
            <span className="info-icon">🔄</span>
            <div>
              <strong>Automático:</strong> O sistema monitora uma pasta configurada e importa
              automaticamente PDFs de ordens de serviço, extraindo todos os dados necessários.
            </div>
          </div>

          <h3>Visualizar Ordens de Serviço</h3>
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Lista de OS</h4>
              <p>Acesse <strong>Dashboard → Ordens de Serviço</strong></p>
              <p>A lista exibe:</p>
              <ul>
                <li><strong>Número da OS:</strong> Identificador único</li>
                <li><strong>Cliente:</strong> Nome do contratante</li>
                <li><strong>Evento:</strong> Nome/descrição do evento</li>
                <li><strong>Local:</strong> Endereço de realização</li>
                <li><strong>Data:</strong> Data do evento</li>
                <li><strong>Valor:</strong> Valor do serviço</li>
                <li><strong>Versão:</strong> Número da revisão do documento</li>
              </ul>
            </div>
          </div>

          <h3>Buscar e Filtrar</h3>
          <p>Use a barra de busca para filtrar por:</p>
          <ul>
            <li>Número da OS</li>
            <li>Nome do cliente</li>
            <li>Nome do evento</li>
            <li>Local</li>
          </ul>

          <h3>Ordenação</h3>
          <p>Clique nos cabeçalhos das colunas para ordenar:</p>
          <ul>
            <li>Ordem crescente (A→Z, 0→9, mais antigo→mais recente)</li>
            <li>Ordem decrescente (Z→A, 9→0, mais recente→mais antigo)</li>
          </ul>

          <h3>Visualizar Detalhes</h3>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Modal de Detalhes</h4>
              <p>Clique no ícone <strong>👁️</strong> para abrir o modal com:</p>
              <ul>
                <li><strong>Informações completas da OS</strong></li>
                <li><strong>Todos os atendimentos agendados</strong></li>
                <li><strong>Técnicos alocados</strong></li>
                <li><strong>Status de cada atendimento</strong></li>
                <li><strong>Link para o PDF original</strong></li>
              </ul>
            </div>
          </div>

          <h3>Criar/Editar Ordem de Serviço</h3>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Formulário de OS</h4>
              <p><strong>Criar nova:</strong> Clique em "➕ Nova Ordem de Serviço"</p>
              <p><strong>Editar:</strong> Clique no ícone ✏️ na linha da OS</p>
              
              <h5>Campos obrigatórios:</h5>
              <ul>
                <li>Número da OS</li>
                <li>Nome do cliente</li>
                <li>Nome do evento</li>
                <li>Data do evento</li>
              </ul>

              <h5>Campos opcionais:</h5>
              <ul>
                <li>Local do evento</li>
                <li>Cidade</li>
                <li>Valor do serviço</li>
                <li>Número da versão</li>
                <li>Link do PDF</li>
              </ul>

              <div className="warning-box">
                <span className="warning-icon">⚠️</span>
                <div>
                  <strong>Atenção:</strong> A combinação de número da OS + versão deve ser única.
                  O sistema não permite duplicatas.
                </div>
              </div>
            </div>
          </div>

          <h3>Excluir Ordem de Serviço</h3>
          <p>Clique no ícone <strong>🗑️</strong> e confirme a exclusão.</p>
          <div className="warning-box">
            <span className="warning-icon">⚠️</span>
            <div>
              <strong>Cuidado:</strong> Esta ação marcará a OS como inativa e removerá
              todos os atendimentos associados. Use com cautela!
            </div>
          </div>

          <h3>Paginação</h3>
          <p>A lista é paginada para melhor performance:</p>
          <ul>
            <li><strong>10 itens por página</strong> (padrão)</li>
            <li>Use os botões de navegação no rodapé</li>
            <li>Veja o total de páginas e registros</li>
          </ul>
        </div>
      )
    },
    {
      id: 'tecnicos',
      title: 'Técnicos',
      icon: '👨‍🔧',
      content: (
        <div className="manual-section">
          <h2>Gestão de Técnicos</h2>
          <p>Cadastre e gerencie os técnicos responsáveis pelos atendimentos.</p>

          <h3>Cadastrar Novo Técnico</h3>
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Formulário de Cadastro</h4>
              <p>Clique em "➕ Novo Técnico" e preencha:</p>
              <ul>
                <li><strong>Nome:</strong> Nome completo do técnico</li>
                <li><strong>Especialidade:</strong> Áreas de atuação (separadas por vírgula)</li>
                <li><strong>Telefone:</strong> Contato (opcional)</li>
                <li><strong>Email:</strong> Email para contato (opcional)</li>
              </ul>
            </div>
          </div>

          <h3>Especialidades Múltiplas</h3>
          <div className="info-box">
            <span className="info-icon">💡</span>
            <div>
              <strong>Dica:</strong> Você pode cadastrar múltiplas especialidades separando
              por vírgula. Exemplo: "Áudio, Luz, Vídeo"
            </div>
          </div>
          <p>O sistema irá:</p>
          <ul>
            <li>Exibir cada especialidade como badge colorido</li>
            <li>Contar o técnico em cada especialidade no dashboard</li>
            <li>Facilitar a busca e alocação por especialidade</li>
          </ul>

          <h3>Editar Técnico</h3>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <p>Clique no ícone ✏️ na linha do técnico</p>
              <p>Altere os campos necessários e salve</p>
            </div>
          </div>

          <h3>Desativar Técnico</h3>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <p>Clique no ícone 🗑️ para desativar</p>
              <div className="warning-box">
                <span className="warning-icon">⚠️</span>
                <div>
                  <strong>Nota:</strong> O técnico não será deletado, apenas marcado como
                  inativo. Atendimentos existentes não serão afetados.
                </div>
              </div>
            </div>
          </div>

          <h3>Lista e Filtros</h3>
          <p>Use a busca para filtrar técnicos por:</p>
          <ul>
            <li>Nome</li>
            <li>Especialidade</li>
            <li>Telefone</li>
            <li>Email</li>
          </ul>

          <h3>Ordenação</h3>
          <p>Ordene a lista clicando nos cabeçalhos:</p>
          <ul>
            <li>Nome (alfabética)</li>
            <li>Especialidade</li>
            <li>Telefone</li>
          </ul>
        </div>
      )
    },
    {
      id: 'atendimentos',
      title: 'Atendimentos',
      icon: '🎯',
      content: (
        <div className="manual-section">
          <h2>Gestão de Atendimentos</h2>
          <p>Os atendimentos representam a alocação de técnicos para executar ordens de serviço.</p>

          <h3>Criar Atendimento</h3>
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Novo Agendamento</h4>
              <p>Clique em "➕ Novo Atendimento" e preencha:</p>
              
              <h5>Campos obrigatórios:</h5>
              <ul>
                <li><strong>Ordem de Serviço:</strong> Selecione da lista de OS ativas</li>
                <li><strong>Técnico:</strong> Escolha o técnico responsável</li>
                <li><strong>Data e Hora:</strong> Quando o atendimento ocorrerá</li>
                <li><strong>Status:</strong> Situação atual do atendimento</li>
              </ul>

              <h5>Campos opcionais:</h5>
              <ul>
                <li><strong>Observações:</strong> Notas e detalhes adicionais</li>
              </ul>
            </div>
          </div>

          <h3>Status de Atendimento</h3>
          <div className="metric-grid">
            <div className="metric-item status-pending">
              <span className="metric-icon">⏸</span>
              <strong>Pendente:</strong> Aguardando execução
            </div>
            <div className="metric-item status-progress">
              <span className="metric-icon">⏳</span>
              <strong>Em Andamento:</strong> Sendo executado
            </div>
            <div className="metric-item status-done">
              <span className="metric-icon">✓</span>
              <strong>Concluído:</strong> Finalizado
            </div>
          </div>

          <h3>Visualizar e Filtrar</h3>
          <p>A lista de atendimentos mostra:</p>
          <ul>
            <li>Número da OS relacionada</li>
            <li>Nome do técnico alocado</li>
            <li>Data e hora do atendimento</li>
            <li>Status atual (com badge colorido)</li>
            <li>Observações registradas</li>
          </ul>

          <h3>Editar Atendimento</h3>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <p>Clique no ícone ✏️ para:</p>
              <ul>
                <li>Alterar o técnico responsável</li>
                <li>Reagendar data/hora</li>
                <li>Atualizar o status</li>
                <li>Adicionar ou modificar observações</li>
              </ul>
              <div className="info-box">
                <span className="info-icon">💡</span>
                <div>
                  <strong>Dica:</strong> Use o campo de observações para registrar detalhes
                  importantes sobre o atendimento, equipamentos utilizados, ou problemas encontrados.
                </div>
              </div>
            </div>
          </div>

          <h3>Excluir Atendimento</h3>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <p>Clique no ícone 🗑️ e confirme</p>
              <div className="warning-box">
                <span className="warning-icon">⚠️</span>
                <div>
                  <strong>Atenção:</strong> Esta ação é permanente e não pode ser desfeita.
                </div>
              </div>
            </div>
          </div>

          <h3>Busca Avançada</h3>
          <p>Filtre atendimentos por:</p>
          <ul>
            <li>Número da OS</li>
            <li>Nome do técnico</li>
            <li>Data do atendimento</li>
            <li>Status</li>
          </ul>

          <h3>Ordenação</h3>
          <p>Organize a lista por:</p>
          <ul>
            <li>Data/hora (mais recente ou mais antiga)</li>
            <li>Número da OS</li>
            <li>Nome do técnico</li>
            <li>Status</li>
          </ul>
        </div>
      )
    },
    {
      id: 'usuarios',
      title: 'Usuários',
      icon: '👥',
      content: (
        <div className="manual-section">
          <h2>Gestão de Usuários</h2>
          <p>Gerencie os usuários que têm acesso ao sistema.</p>

          <h3>Criar Novo Usuário</h3>
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Cadastro de Usuário</h4>
              <p>Clique em "➕ Novo Usuário" e preencha:</p>
              
              <h5>Campos obrigatórios:</h5>
              <ul>
                <li><strong>Nome:</strong> Nome completo do usuário</li>
                <li><strong>Email:</strong> Email único para login</li>
                <li><strong>Senha:</strong> Mínimo 6 caracteres</li>
                <li><strong>PIN:</strong> 4 dígitos para login touch screen</li>
              </ul>

              <div className="warning-box">
                <span className="warning-icon">⚠️</span>
                <div>
                  <strong>Segurança:</strong> As senhas são armazenadas de forma segura e criptografada no sistema.
                </div>
              </div>
            </div>
          </div>

          <h3>Níveis de Acesso</h3>
          <p>O sistema possui perfis de usuário:</p>
          <ul>
            <li><strong>Administrador:</strong> Acesso completo a todas as funcionalidades</li>
            <li><strong>Operador:</strong> Visualização e edição de OS e atendimentos</li>
            <li><strong>Técnico:</strong> Visualização apenas dos seus atendimentos</li>
          </ul>

          <h3>Editar Usuário</h3>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <p>Clique no ícone ✏️ para editar:</p>
              <ul>
                <li>Nome do usuário</li>
                <li>Email (deve ser único)</li>
                <li>Senha (deixe em branco para manter a atual)</li>
                <li>PIN de acesso</li>
                <li>Status ativo/inativo</li>
              </ul>
              <div className="info-box">
                <span className="info-icon">💡</span>
                <div>
                  <strong>Dica:</strong> Ao editar, você não precisa informar a senha novamente
                  se não quiser alterá-la. Deixe o campo vazio para manter a senha atual.
                </div>
              </div>
            </div>
          </div>

          <h3>Desativar Usuário</h3>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <p>Clique no ícone 🗑️ para desativar</p>
              <div className="warning-box">
                <span className="warning-icon">⚠️</span>
                <div>
                  <strong>Nota:</strong> Usuários desativados não poderão fazer login,
                  mas seus dados históricos são preservados.
                </div>
              </div>
            </div>
          </div>

          <h3>Busca e Filtros</h3>
          <p>Encontre usuários rapidamente filtrando por:</p>
          <ul>
            <li>Nome</li>
            <li>Email</li>
          </ul>

          <h3>Segurança de Senha</h3>
          <div className="info-box">
            <span className="info-icon">🔐</span>
            <div>
              <strong>Boas práticas:</strong>
              <ul>
                <li>Use senhas com pelo menos 8 caracteres</li>
                <li>Combine letras, números e símbolos</li>
                <li>Não compartilhe suas credenciais</li>
                <li>Altere sua senha periodicamente</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sync',
      title: 'Sincronização de PDFs',
      icon: '🔄',
      content: (
        <div className="manual-section">
          <h2>Sincronização Automática de PDFs</h2>
          <p>O sistema monitora uma pasta configurada e importa automaticamente ordens de serviço de arquivos PDF.</p>

          <h3>Como Funciona</h3>
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Monitoramento Contínuo</h4>
              <p>O sistema verifica a pasta a cada intervalo configurado (padrão: 10 minutos)</p>
              <ul>
                <li>Detecta novos arquivos PDF</li>
                <li>Identifica alterações em PDFs existentes</li>
                <li>Processa automaticamente</li>
              </ul>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Extração de Dados</h4>
              <p>O parser analisa o PDF e extrai:</p>
              <ul>
                <li>Número da ordem de serviço</li>
                <li>Nome do cliente</li>
                <li>Nome do evento</li>
                <li>Local e cidade</li>
                <li>Data do evento</li>
                <li>Valor do serviço</li>
                <li>Número da versão</li>
              </ul>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Atualização do Banco</h4>
              <p>Os dados são inseridos/atualizados automaticamente</p>
              <ul>
                <li>Novas OS são criadas</li>
                <li>OS existentes são atualizadas (nova versão)</li>
                <li>Notificações são enviadas via Socket.IO</li>
              </ul>
            </div>
          </div>

          <h3>Barra de Progresso</h3>
          <p>Durante a sincronização, você verá uma barra de progresso no canto inferior esquerdo:</p>
          <ul>
            <li><strong>Azul:</strong> Sincronização em andamento</li>
            <li><strong>Porcentagem:</strong> Progresso atual</li>
            <li><strong>Mensagem:</strong> "Sincronizando PDFs..."</li>
          </ul>
          <div className="info-box">
            <span className="info-icon">💡</span>
            <div>
              <strong>Tempo real:</strong> A barra de progresso é atualizada automaticamente,
              permitindo acompanhar o processo de qualquer dispositivo conectado.
            </div>
          </div>

          <h3>Notificações</h3>
          <p>Após a sincronização, você recebe notificações com:</p>
          <ul>
            <li>Número de OS processadas</li>
            <li>Quantidade de novas OS</li>
            <li>Quantidade de atualizações</li>
            <li>Eventuais erros encontrados</li>
          </ul>

          <h3>Resolução de Problemas</h3>
          <div className="expandable-item">
            <button 
              className="expand-header"
              onClick={() => toggleExpand('sync-problem-1')}
            >
              <span className="expand-icon">{expandedItems.has('sync-problem-1') ? '▼' : '▶'}</span>
              <strong>PDFs não estão sendo processados</strong>
            </button>
            {expandedItems.has('sync-problem-1') && (
              <div className="expand-content">
                <p><strong>Solução:</strong> Entre em contato com o administrador do sistema para verificar as configurações.</p>
              </div>
            )}
          </div>

          <div className="expandable-item">
            <button 
              className="expand-header"
              onClick={() => toggleExpand('sync-problem-2')}
            >
              <span className="expand-icon">{expandedItems.has('sync-problem-2') ? '▼' : '▶'}</span>
              <strong>Dados extraídos incorretamente</strong>
            </button>
            {expandedItems.has('sync-problem-2') && (
              <div className="expand-content">
                <p><strong>Solução:</strong> Entre em contato com o suporte técnico para ajustes necessários.</p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'tips',
      title: 'Dicas e Atalhos',
      icon: '💡',
      content: (
        <div className="manual-section">
          <h2>Dicas e Atalhos</h2>
          <p>Aproveite ao máximo o sistema com estas dicas úteis!</p>

          <h3>Interface e Navegação</h3>
          <div className="tip-card">
            <span className="tip-icon">⌨️</span>
            <div>
              <h4>Busca Rápida</h4>
              <p>Use a barra de busca para filtrar resultados instantaneamente. A busca é case-insensitive e busca em múltiplos campos simultaneamente.</p>
            </div>
          </div>

          <div className="tip-card">
            <span className="tip-icon">🔢</span>
            <div>
              <h4>Ordenação Inteligente</h4>
              <p>Clique nos cabeçalhos das tabelas para ordenar. Clique novamente para inverter a ordem.</p>
            </div>
          </div>

          <div className="tip-card">
            <span className="tip-icon">📱</span>
            <div>
              <h4>Design Responsivo</h4>
              <p>O sistema funciona perfeitamente em tablets e smartphones. No mobile, o menu fica no rodapé para fácil acesso.</p>
            </div>
          </div>

          <h3>Produtividade</h3>
          <div className="tip-card">
            <span className="tip-icon">🎯</span>
            <div>
              <h4>Visualização Modal</h4>
              <p>Use os modais de visualização para ver detalhes completos sem sair da lista principal.</p>
            </div>
          </div>

          <div className="tip-card">
            <span className="tip-icon">📊</span>
            <div>
              <h4>Dashboard Personalizado</h4>
              <p>Use os filtros de período no ranking de técnicos para análises específicas e relatórios gerenciais.</p>
            </div>
          </div>

          <div className="tip-card">
            <span className="tip-icon">🔔</span>
            <div>
              <h4>Notificações em Tempo Real</h4>
              <p>Fique atento às notificações que aparecem no canto superior direito. Elas informam sobre novas OS, atualizações e erros.</p>
            </div>
          </div>

          <h3>Dados e Sincronização</h3>
          <div className="tip-card">
            <span className="tip-icon">💾</span>
            <div>
              <h4>Salvamento Automático</h4>
              <p>Ao criar ou editar registros, não se preocupe em salvar manualmente - o formulário valida e salva automaticamente ao clicar em "Salvar".</p>
            </div>
          </div>

          <div className="tip-card">
            <span className="tip-icon">🔄</span>
            <div>
              <h4>Acompanhe a Sincronização</h4>
              <p>A barra de progresso no rodapé mostra o status da importação de PDFs. Ela é visível em todas as telas.</p>
            </div>
          </div>

          <h3>Segurança</h3>
          <div className="tip-card">
            <span className="tip-icon">🔐</span>
            <div>
              <h4>Sessão Segura</h4>
              <p>Sua sessão expira automaticamente. Faça logout ao terminar de usar o sistema em computadores compartilhados.</p>
            </div>
          </div>

          <div className="tip-card">
            <span className="tip-icon">🔑</span>
            <div>
              <h4>PIN Touch Screen</h4>
              <p>Use o login por PIN em tablets no local de eventos para acesso rápido e prático.</p>
            </div>
          </div>

          <h3>Mobile</h3>
          <div className="tip-card">
            <span className="tip-icon">📱</span>
            <div>
              <h4>Menu Inferior</h4>
              <p>Em dispositivos móveis, o menu fica na parte inferior da tela para facilitar o uso com uma mão.</p>
            </div>
          </div>

          <div className="tip-card">
            <span className="tip-icon">👆</span>
            <div>
              <h4>Toque e Deslize</h4>
              <p>Use gestos de toque para navegar pelas tabelas. Deslize para o lado para ver mais colunas.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'FAQ - Perguntas Frequentes',
      icon: '❓',
      content: (
        <div className="manual-section">
          <h2>Perguntas Frequentes</h2>

          <div className="faq-item">
            <h3>❓ Como recupero minha senha?</h3>
            <p>Atualmente o sistema não possui recuperação automática de senha. Entre em contato com o administrador do sistema para redefinir sua senha.</p>
          </div>

          <div className="faq-item">
            <h3>❓ Posso ter múltiplas sessões ativas?</h3>
            <p>Sim! Você pode fazer login em múltiplos dispositivos simultaneamente. Cada sessão é independente e expira em 12 horas.</p>
          </div>

          <div className="faq-item">
            <h3>❓ Como altero a pasta de PDFs?</h3>
            <p>Entre em contato com o administrador do sistema para realizar alterações de configuração.</p>
          </div>

          <div className="faq-item">
            <h3>❓ Os dados são salvos automaticamente?</h3>
            <p>Não. Você precisa clicar no botão "Salvar" nos formulários. Os dados não são perdidos se você fechar o modal sem salvar, mas as alterações também não são aplicadas.</p>
          </div>

          <div className="faq-item">
            <h3>❓ Posso restaurar uma OS deletada?</h3>
            <p>Não diretamente pela interface. Entre em contato com o administrador do sistema para solicitar a restauração de dados.</p>
          </div>

          <div className="faq-item">
            <h3>❓ Quantos técnicos posso cadastrar por OS?</h3>
            <p>Não há limite! Você pode criar múltiplos atendimentos para a mesma OS, cada um com um técnico diferente e em horários diferentes.</p>
          </div>

          <div className="faq-item">
            <h3>❓ Como funciona a ordenação das tabelas?</h3>
            <p>Clique no cabeçalho da coluna uma vez para ordem crescente, duas vezes para ordem decrescente. A coluna ativa mostra um indicador visual.</p>
          </div>

          <div className="faq-item">
            <h3>❓ Os PDFs são armazenados no sistema?</h3>
            <p>O sistema processa e armazena as informações dos PDFs de forma segura para consulta rápida.</p>
          </div>

          <div className="faq-item">
            <h3>❓ Posso usar o sistema offline?</h3>
            <p>Não. O sistema requer conexão com o servidor backend para todas as operações. Sem internet, apenas a última tela carregada ficará visível.</p>
          </div>

          <div className="faq-item">
            <h3>❓ Como sei se há novos dados disponíveis?</h3>
            <p>O sistema envia notificações automáticas em tempo real sempre que houver novas OS ou atualizações importantes.</p>
          </div>

          <div className="faq-item">
            <h3>❓ Posso exportar os dados?</h3>
            <p>Para exportação de dados, entre em contato com o administrador do sistema que poderá gerar relatórios personalizados.</p>
          </div>

          <div className="faq-item">
            <h3>❓ O sistema suporta múltiplos idiomas?</h3>
            <p>No momento, o sistema está disponível apenas em Português (Brasil).</p>
          </div>
        </div>
      )
    },
    {
      id: 'support',
      title: 'Suporte e Contato',
      icon: '📞',
      content: (
        <div className="manual-section">
          <h2>Suporte e Contato</h2>
          <p>Precisa de ajuda adicional? Entre em contato conosco!</p>

          <div className="support-card">
            <span className="support-icon">💬</span>
            <div>
              <h3>Suporte Técnico</h3>
              <p>Para problemas técnicos, bugs ou dúvidas sobre funcionalidades:</p>
              <p className="contact-info">📧 Email: suporte@siberius.com</p>
              <p className="contact-info">📱 Telefone: (11) 1234-5678</p>
            </div>
          </div>

          <div className="support-card">
            <span className="support-icon">🎓</span>
            <div>
              <h3>Treinamento</h3>
              <p>Agende um treinamento personalizado para sua equipe:</p>
              <p className="contact-info">📧 Email: treinamento@siberius.com</p>
            </div>
          </div>

          <div className="support-card">
            <span className="support-icon">💡</span>
            <div>
              <h3>Sugestões e Melhorias</h3>
              <p>Tem ideias para melhorar o sistema? Adoraríamos ouvir!</p>
              <p className="contact-info">📧 Email: feedback@siberius.com</p>
            </div>
          </div>

          <div className="support-card">
            <span className="support-icon">🐛</span>
            <div>
              <h3>Relatar um Bug</h3>
              <p>Encontrou um problema? Reporte para que possamos corrigi-lo:</p>
              <p className="contact-info">📧 Email: bugs@siberius.com</p>
              <div className="info-box">
                <span className="info-icon">📋</span>
                <div>
                  <strong>Ao relatar um bug, inclua:</strong>
                  <ul>
                    <li>Descrição detalhada do problema</li>
                    <li>Passos para reproduzir o erro</li>
                    <li>Capturas de tela (se possível)</li>
                    <li>Navegador e versão utilizada</li>
                    <li>Mensagens de erro (se houver)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <h3>Horário de Atendimento</h3>
          <p>Segunda a Sexta: 9h às 18h (horário de Brasília)</p>
          <p>Sábados, domingos e feriados: Atendimento apenas para emergências</p>

          <h3>Informações da Versão</h3>
          <div className="version-info">
            <p><strong>Sistema:</strong> Siberius v1.0.0</p>
            <p><strong>Última Atualização:</strong> Dezembro 2025</p>
          </div>

          <div className="info-box">
            <span className="info-icon">🔒</span>
            <div>
              <strong>Privacidade:</strong> Seus dados são tratados com confidencialidade
              de acordo com a LGPD. Não compartilhamos informações com terceiros.
            </div>
          </div>
        </div>
      )
    }
  ];

  const activeContent = sections.find(s => s.id === activeSection)?.content;

  return (
    <div className="user-manual">
      <div className="manual-header-compact">
        <div className="header-top">
          <h1>📚 Manual do Usuário</h1>
          <span className="version-badge">v1.0.0</span>
        </div>
        
        <div className="header-controls">
          <div className="section-selector">
            <label>Seção:</label>
            <select 
              value={activeSection} 
              onChange={(e) => setActiveSection(e.target.value)}
              className="section-dropdown"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.icon} {section.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="search-box-compact">
            <input
              type="text"
              placeholder="🔍 Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="manual-content-full">
        {activeContent}
      </div>
    </div>
  );
}

export default UserManual;
