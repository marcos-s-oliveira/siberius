import { useState, useEffect } from 'react';
import { atendimentosAPI, ordensServicoAPI, tecnicosAPI } from '../services/api';
import type { Atendimento, OrdemServico, Tecnico } from '../types';
import AtendimentoForm from './AtendimentoForm';
import Spinner from './Spinner';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { useSortableTable } from '../hooks/useSortableTable';

function AtendimentoList() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [atendimentosRes, ordensRes, tecnicosRes] = await Promise.all([
        atendimentosAPI.getAll(),
        ordensServicoAPI.getAll(),
        tecnicosAPI.getAll()
      ]);
      setAtendimentos(atendimentosRes.data);
      setOrdens(ordensRes.data);
      setTecnicos(tecnicosRes.data);
    } catch (err: any) {
      setError(err.userMessage || 'Erro ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (atendimento: Atendimento) => {
    setEditingAtendimento(atendimento);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAtendimento(null);
  };

  const handleSave = () => {
    loadData();
    handleCloseForm();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este atendimento?')) return;
    
    try {
      await atendimentosAPI.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.userMessage || 'Erro ao excluir atendimento');
    }
  };

  const getOrdemNumero = (atendimento: Atendimento) => {
    return atendimento.ordemServico?.numeroOS || '-';
  };

  const getTecnicosDisplay = (atendimento: Atendimento) => {
    if (!atendimento.tecnicos || atendimento.tecnicos.length === 0) {
      return <span className="no-tecnicos">Sem técnicos</span>;
    }

    if (atendimento.tecnicos.length === 1) {
      const tec = atendimento.tecnicos[0];
      return (
        <div className="tecnico-info">
          <span className="tecnico-nome">{tec.tecnico?.nome || 'Desconhecido'}</span>
          {tec.funcao && <span className="tecnico-funcao">({tec.funcao})</span>}
        </div>
      );
    }

    // Múltiplos técnicos
    return (
      <div className="tecnicos-list" title={atendimento.tecnicos.map(t => `${t.tecnico?.nome}${t.funcao ? ` (${t.funcao})` : ''}`).join(', ')}>
        <span className="tecnico-nome">{atendimento.tecnicos[0].tecnico?.nome}</span>
        <span className="tecnicos-count">+{atendimento.tecnicos.length - 1}</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; class: string }> = {
      nao_agendado: { label: 'Não Agendado', class: 'secondary' },
      agendado: { label: 'Agendado', class: 'info' },
      em_andamento: { label: 'Em Andamento', class: 'warning' },
      concluido: { label: 'Concluído', class: 'success' },
      cancelado: { label: 'Cancelado', class: 'danger' },
    };
    const badge = badges[status] || { label: status, class: 'info' };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  const filteredAtendimentos = atendimentos.filter(atend =>
    statusFilter === 'all' || atend.status === statusFilter
  );

  // Usar hook de ordenação
  const { sortedData, handleSort, getSortIndicator } = useSortableTable(filteredAtendimentos, 'dataAgendamento');

  // Usar hook de paginação
  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    itemsPerPage,
    goToPage,
    setItemsPerPage,
  } = usePagination(sortedData, 25);

  if (showForm) {
    return (
      <AtendimentoForm
        atendimento={editingAtendimento}
        ordens={ordens}
        tecnicos={tecnicos}
        onSave={handleSave}
        onCancel={handleCloseForm}
      />
    );
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Atendimentos</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <span>+</span> Novo Atendimento
        </button>
      </div>

      <div className="list-filters">
        <select
          className="filter-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos os status</option>
          <option value="nao_agendado">Não Agendado</option>
          <option value="agendado">Agendado</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {loading && (
        <div className="loading-state">
          <Spinner size="large" message="Carregando atendimentos..." />
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn-primary" onClick={loadData}>Tentar novamente</button>
        </div>
      )}

      {!loading && !error && filteredAtendimentos.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <h3>Nenhum atendimento encontrado</h3>
          <p>Comece criando seu primeiro atendimento.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Criar Atendimento
          </button>
        </div>
      )}

      {!loading && !error && filteredAtendimentos.length > 0 && (
        <>
          <div className="pagination-info">
            Mostrando {startIndex + 1} - {Math.min(endIndex, totalItems)} de {totalItems} atendimentos
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')}>
                    ID {getSortIndicator('id')}
                  </th>
                  <th onClick={() => handleSort('ordemServicoId')}>
                    Ordem de Serviço {getSortIndicator('ordemServicoId')}
                  </th>
                  <th>Equipe</th>
                  <th onClick={() => handleSort('dataAgendamento')}>
                    Data Agendamento {getSortIndicator('dataAgendamento')}
                  </th>
                  <th onClick={() => handleSort('status')}>
                    Status {getSortIndicator('status')}
                  </th>
                  <th>Observações</th>
                  <th className="actions-column">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(atendimento => (
                  <tr key={atendimento.id}>
                    <td>{atendimento.id}</td>
                    <td>{getOrdemNumero(atendimento)}</td>
                    <td>{getTecnicosDisplay(atendimento)}</td>
                    <td>{new Date(atendimento.dataAgendamento).toLocaleDateString('pt-BR')}</td>
                    <td>{getStatusBadge(atendimento.status)}</td>
                    <td className="truncate">{atendimento.observacoes || '-'}</td>
                    <td className="actions-column">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(atendimento)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(atendimento.id)}
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={goToPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}
    </div>
  );
}

export default AtendimentoList;
