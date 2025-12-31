import { useState, useEffect } from 'react';
import { tecnicosAPI } from '../services/api';
import type { Tecnico } from '../types';
import TecnicoForm from './TecnicoForm';
import { parseEspecialidades } from '../utils/especialidades';
import { useSortableTable } from '../hooks/useSortableTable';
import { usePagination } from '../hooks/usePagination';
import Pagination from './Pagination';
import Spinner from './Spinner';

function TecnicoList() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);

  useEffect(() => {
    loadTecnicos();
  }, []);

  const loadTecnicos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tecnicosAPI.getAll();
      setTecnicos(response.data);
    } catch (err: any) {
      setError(err.userMessage || 'Erro ao carregar técnicos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tecnico: Tecnico) => {
    setEditingTecnico(tecnico);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTecnico(null);
  };

  const handleSave = () => {
    loadTecnicos();
    handleCloseForm();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este técnico?')) return;
    
    try {
      await tecnicosAPI.delete(id);
      loadTecnicos();
    } catch (err: any) {
      alert(err.userMessage || 'Erro ao excluir técnico');
    }
  };

  const filteredTecnicos = tecnicos.filter(tec =>
    tec.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tec.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tec.especialidade && tec.especialidade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Usar hook de ordenação
  const { sortedData, handleSort, getSortIndicator } = useSortableTable(filteredTecnicos, 'nome', 'asc');

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
      <TecnicoForm
        tecnico={editingTecnico}
        onSave={handleSave}
        onCancel={handleCloseForm}
      />
    );
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Técnicos</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <span>+</span> Novo Técnico
        </button>
      </div>

      <div className="list-filters">
        <input
          type="text"
          className="filter-input"
          placeholder="Buscar por nome, email ou especialidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && (
        <div className="loading-state">
          <Spinner size="large" message="Carregando técnicos..." />
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn-primary" onClick={loadTecnicos}>Tentar novamente</button>
        </div>
      )}

      {!loading && !error && filteredTecnicos.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">👨‍🔧</div>
          <p>Nenhum técnico encontrado</p>
        </div>
      )}

      {!loading && !error && filteredTecnicos.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('nome')}>
                  Nome{getSortIndicator('nome')}
                </th>
                <th className="sortable" onClick={() => handleSort('email')}>
                  Email{getSortIndicator('email')}
                </th>
                <th className="sortable" onClick={() => handleSort('telefone')}>
                  Telefone{getSortIndicator('telefone')}
                </th>
                <th className="sortable" onClick={() => handleSort('especialidade')}>
                  Especialidade{getSortIndicator('especialidade')}
                </th>
                <th className="sortable" onClick={() => handleSort('ativo')}>
                  Status{getSortIndicator('ativo')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((tecnico) => (
                <tr key={tecnico.id}>
                  <td><strong>{tecnico.nome}</strong></td>
                  <td>{tecnico.email}</td>
                  <td>{tecnico.telefone || '-'}</td>
                  <td>
                    {tecnico.especialidade ? (
                      <div className="especialidades-container">
                        {parseEspecialidades(tecnico.especialidade).map((esp, idx) => (
                          <span key={idx} className="especialidade-badge">{esp}</span>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    {tecnico.ativo ? (
                      <span className="badge success">Ativo</span>
                    ) : (
                      <span className="badge danger">Inativo</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(tecnico)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(tecnico.id)}
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

export default TecnicoList;
