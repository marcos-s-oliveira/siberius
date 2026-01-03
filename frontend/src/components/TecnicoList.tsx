import { useState, useEffect } from 'react';
import { tecnicosAPI } from '../services/api';
import type { Tecnico } from '../types';
import TecnicoForm from './TecnicoForm';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';
import { parseEspecialidades } from '../utils/especialidades';
import { useSortableTable } from '../hooks/useSortableTable';
import { usePagination } from '../hooks/usePagination';
import Pagination from './Pagination';
import Spinner from './Spinner';
import QRCode from 'qrcode';

function TecnicoList() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrTecnicoNome, setQrTecnicoNome] = useState<string>('');
  const [generatingQR, setGeneratingQR] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '', type: 'info' as 'info' | 'success' | 'warning' | 'error' });
  const [selectedTecnico, setSelectedTecnico] = useState<Tecnico | null>(null);

  useEffect(() => {
    loadTecnicos();
  }, []);

  // Gerar QR code quando os dados mudarem
  useEffect(() => {
    if (qrData) {
      generateQRCode(qrData);
    }
  }, [qrData]);

  const generateQRCode = async (data: string) => {
    try {
      const url = await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Erro ao gerar QR code:', err);
    }
  };

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

  const handleDelete = (tecnico: Tecnico) => {
    setSelectedTecnico(tecnico);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedTecnico) return;
    
    try {
      await tecnicosAPI.delete(selectedTecnico.id);
      loadTecnicos();
    } catch (err: any) {
      setAlertMessage({
        title: 'Erro',
        message: err.userMessage || 'Erro ao excluir técnico',
        type: 'error'
      });
      setShowAlert(true);
    }
  };

  const handleGenerateQR = async (tecnico: Tecnico) => {
    setSelectedTecnico(tecnico);
    setShowGenerateConfirm(true);
  };

  const confirmGenerateQR = async () => {
    if (!selectedTecnico) return;
    
    try {
      setGeneratingQR(true);
      const response = await tecnicosAPI.generateMobileToken(selectedTecnico.id);
      setQrData(response.data.qrData);
      setQrTecnicoNome(selectedTecnico.nome);
      setShowQRModal(true);
    } catch (err: any) {
      setAlertMessage({
        title: 'Erro',
        message: err.userMessage || 'Erro ao gerar token mobile',
        type: 'error'
      });
      setShowAlert(true);
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setQrData('');
    setQrCodeUrl('');
    setQrTecnicoNome('');
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
                        className="btn-icon"
                        onClick={() => handleGenerateQR(tecnico)}
                        title="Gerar QR Code para App Mobile"
                        disabled={generatingQR}
                      >
                        📱
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(tecnico)}
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

      {/* Modal de QR Code */}
      <Modal
        isOpen={showQRModal}
        onClose={handleCloseQRModal}
        title={`QR Code - ${qrTecnicoNome}`}
        size="medium"
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Escaneie este QR Code com o aplicativo mobile do técnico
          </p>
          
          {qrCodeUrl ? (
            <div style={{ 
              display: 'inline-block', 
              padding: '20px', 
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <img
                src={qrCodeUrl}
                alt="QR Code para acesso mobile"
                style={{ display: 'block', width: '300px', height: '300px' }}
              />
            </div>
          ) : (
            <div style={{ padding: '40px' }}>
              <Spinner size="large" message="Gerando QR Code..." />
            </div>
          )}
          
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#999' }}>
            Este QR Code é válido até ser gerado um novo token para este técnico
          </p>
          
          <div style={{ marginTop: '20px' }}>
            <button 
              className="btn-primary" 
              onClick={handleCloseQRModal}
              style={{ minWidth: '150px' }}
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação - Deletar - NUNCA USE window.confirm()! */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Deseja realmente excluir o técnico ${selectedTecnico?.nome}?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmStyle="danger"
      />

      {/* Modal de Confirmação - Gerar Token - NUNCA USE window.confirm()! */}
      <ConfirmModal
        isOpen={showGenerateConfirm}
        onClose={() => setShowGenerateConfirm(false)}
        onConfirm={confirmGenerateQR}
        title="Gerar Token Mobile"
        message={`Deseja gerar um novo token mobile para ${selectedTecnico?.nome}? Isso criará um novo QR Code para acesso ao aplicativo.`}
        confirmText="Gerar Token"
        cancelText="Cancelar"
        confirmStyle="primary"
      />

      {/* Modal de Alerta - NUNCA USE window.alert()! */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertMessage.title}
        message={alertMessage.message}
        type={alertMessage.type}
      />
    </div>
  );
}

export default TecnicoList;
