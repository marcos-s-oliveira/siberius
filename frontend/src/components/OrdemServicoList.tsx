import { useState, useEffect } from 'react';
import { ordensServicoAPI } from '../services/api';
import type { OrdemServico } from '../types';
import OrdemServicoForm from './OrdemServicoForm';
import { useSortableTable } from '../hooks/useSortableTable';
import { usePagination } from '../hooks/usePagination';
import Pagination from './Pagination';
import Spinner from './Spinner';

function OrdemServicoList() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOS, setEditingOS] = useState<OrdemServico | null>(null);

  useEffect(() => {
    loadOrdens();
  }, []);

  const loadOrdens = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordensServicoAPI.getAll();
      setOrdens(response.data);
    } catch (err: any) {
      setError(err.userMessage || 'Erro ao carregar ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (os: OrdemServico) => {
    setEditingOS(os);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOS(null);
  };

  const handleSave = () => {
    loadOrdens();
    handleCloseForm();
  };

  const filteredOrdens = ordens.filter(os =>
    os.numeroOS.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.nomeEvento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Usar hook de ordenação
  const { sortedData, handleSort, getSortIndicator } = useSortableTable(filteredOrdens, 'numeroOS', 'asc');

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
      <OrdemServicoForm
        ordemServico={editingOS}
        onSave={handleSave}
        onCancel={handleCloseForm}
      />
    );
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Ordens de Serviço</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <span>+</span> Nova Ordem
        </button>
      </div>

      <div className="list-filters">
        <input
          type="text"
          className="filter-input"
          placeholder="Buscar por número, cliente ou evento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && (
        <div className="loading-state">
          <Spinner size="large" message="Carregando ordens de serviço..." />
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn-primary" onClick={loadOrdens}>Tentar novamente</button>
        </div>
      )}

      {!loading && !error && filteredOrdens.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>Nenhuma ordem de serviço encontrada</p>
        </div>
      )}

      {!loading && !error && filteredOrdens.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('numeroOS')}>
                  Número OS{getSortIndicator('numeroOS')}
                </th>
                <th className="sortable" onClick={() => handleSort('versao')}>
                  Versão{getSortIndicator('versao')}
                </th>
                <th className="sortable" onClick={() => handleSort('nomeCliente')}>
                  Cliente{getSortIndicator('nomeCliente')}
                </th>
                <th className="sortable" onClick={() => handleSort('nomeEvento')}>
                  Evento{getSortIndicator('nomeEvento')}
                </th>
                <th className="sortable" onClick={() => handleSort('data')}>
                  Data{getSortIndicator('data')}
                </th>
                <th className="sortable" onClick={() => handleSort('ativa')}>
                  Status{getSortIndicator('ativa')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((os) => (
                <tr key={os.id}>
                  <td><strong>{os.numeroOS}</strong></td>
                  <td>{os.versao}</td>
                  <td>{os.nomeCliente}</td>
                  <td>{os.nomeEvento}</td>
                  <td>{new Date(os.data).toLocaleDateString('pt-BR')}</td>
                  <td>
                    {os.ativa ? (
                      <span className="badge success">Ativa</span>
                    ) : (
                      <span className="badge danger">Inativa</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(os)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <a
                        href={ordensServicoAPI.getPdfUrl(os.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-icon"
                        title="Ver PDF"
                      >
                        📄
                      </a>
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

export default OrdemServicoList;
