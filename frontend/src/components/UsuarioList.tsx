import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import type { Usuario } from '../types';
import UsuarioForm from './UsuarioForm';
import Spinner from './Spinner';
import { useSortableTable } from '../hooks/useSortableTable';

function UsuarioList() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getUsuariosFull();
      setUsuarios(response.data);
    } catch (err: any) {
      setError(err.userMessage || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUsuario(null);
  };

  const handleSave = () => {
    loadUsuarios();
    handleCloseForm();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    
    try {
      await authAPI.deleteUsuario(id);
      loadUsuarios();
    } catch (err: any) {
      alert(err.userMessage || 'Erro ao excluir usuário');
    }
  };

  const filteredUsuarios = usuarios.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Usar hook de ordenação
  const { sortedData, handleSort, getSortIndicator } = useSortableTable(filteredUsuarios, 'nome', 'asc');

  if (showForm) {
    return (
      <UsuarioForm
        usuario={editingUsuario}
        onSave={handleSave}
        onCancel={handleCloseForm}
      />
    );
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Usuários</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <span>+</span> Novo Usuário
        </button>
      </div>

      <div className="list-filters">
        <input
          type="text"
          className="filter-input"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && (
        <div className="loading-state">
          <Spinner size="large" message="Carregando usuários..." />
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn-primary" onClick={loadUsuarios}>Tentar novamente</button>
        </div>
      )}

      {!loading && !error && filteredUsuarios.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p>Nenhum usuário encontrado</p>
        </div>
      )}

      {!loading && !error && filteredUsuarios.length > 0 && (
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
                <th className="sortable" onClick={() => handleSort('ativo')}>
                  Status{getSortIndicator('ativo')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((usuario) => (
                <tr key={usuario.id}>
                  <td><strong>{usuario.nome}</strong></td>
                  <td>{usuario.email}</td>
                  <td>
                    {usuario.ativo ? (
                      <span className="badge success">Ativo</span>
                    ) : (
                      <span className="badge danger">Inativo</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(usuario)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(usuario.id)}
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
        </div>
      )}
    </div>
  );
}

export default UsuarioList;
