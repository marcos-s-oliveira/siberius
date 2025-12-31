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

  const getOrdemNumero = (osId: number) => {
    const os = ordens.find(o => o.id === osId);
    return os ? os.numeroOS : '-';
  };

  const getTecnicosNomes = (atendimento: Atendimento): string => {
    if (!atendimento.tecnicos || atendimento.tecnicos.length === 0) {
      return 'Sem técnicos';
    }
    
    if (atendimento.tecnicos.length === 1) {
      return atendimento.tecnicos[0].tecnico?.nome || 'Desconhecido';
    }
    
    // Múltiplos técnicos: mostrar todos separados por vírgula ou resumir
    const nomes = atendimento.tecnicos.map(t => t.tecnico?.nome || 'Desconhecido');
    if (nomes.join(', ').length > 40) {
      return `${nomes[0]} +${atendimento.tecnicos.length - 1} outros`;
    }
    return nomes.join(', ');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; class: string }> = {
      nao_agendado: { label: 'Não Agendado', class: 'secondary' },
      agendado: { label: 'Agendado', class: 'warning' },
      em_andamento: { label: 'Em Andamento', class: 'info' },
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
  const { sortedData, handleSort, getSortIndicator } = useSortableTable(filteredAtendimentos, 'ordemServicoId');

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
          <p>Nenhum atendimento encontrado</p>
        </div>
      )}

      {!loading && !error && filteredAtendimentos.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('ordemServicoId')}>
                  OS{getSortIndicator('ordemServicoId')}
                </th>
                <th>Técnicos</th>
                <th className="sortable" onClick={() => handleSort('dataAgendamento')}>
                  Data Agendamento{getSortIndicator('dataAgendamento')}
                </th>
                <th className="sortable" onClick={() => handleSort('status')}>
                  Status{getSortIndicator('status')}
                </th>
                <th className="sortable" onClick={() => handleSort('observacoes')}>
                  Observações{getSortIndicator('observacoes')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((atend) => (
                <tr key={atend.id}>
                  <td><strong>{getOrdemNumero(atend.ordemServicoId)}</strong></td>
                  <td>{getTecnicosNomes(atend)}</td>
                  <td>{new Date(atend.dataAgendamento).toLocaleDateString('pt-BR')}</td>
                  <td>{getStatusBadge(atend.status)}</td>
                  <td>{atend.observacoes || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(atend)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(atend.id)}
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}
    </div>
  );
}

export default AtendimentoList;
