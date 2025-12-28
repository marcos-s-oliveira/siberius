import { useState, useEffect } from 'react';
import { ordensServicoAPI, atendimentosAPI, tecnicosAPI } from '../services/api';
import type { OrdemServico, Tecnico, Atendimento } from '../types';
import Spinner from './Spinner';
import { withMinDelay } from '../utils/delay';
import './OSModal.css';

interface OSModalProps {
  os: OrdemServico;
  onClose: () => void;
  onUpdate?: (updatedOS: OrdemServico) => void;
}

type EditingField = 'nomeCliente' | 'nomeEvento' | 'data' | null;
type ModalView = 'details' | 'pdf' | 'team';

export default function OSModal({ os, onClose, onUpdate }: OSModalProps) {
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [currentView, setCurrentView] = useState<ModalView>('details');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para gerenciamento de equipe
  const [allTecnicos, setAllTecnicos] = useState<Tecnico[]>([]);
  const [equipe, setEquipe] = useState<Atendimento[]>(os.atendimentos || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingTecnicos, setLoadingTecnicos] = useState(false);
  const [filterEspecialidade, setFilterEspecialidade] = useState<string>('todas');
  
  const [formData, setFormData] = useState({
    nomeCliente: os.nomeCliente,
    nomeEvento: os.nomeEvento,
    data: new Date(os.data).toISOString().split('T')[0],
  });

  // Carregar equipe ao abrir o modal
  useEffect(() => {
    loadEquipe();
  }, []);

  useEffect(() => {
    if (currentView === 'team') {
      loadTecnicos();
    }
  }, [currentView]);

  const loadTecnicos = async () => {
    try {
      setLoadingTecnicos(true);
      const response = await withMinDelay(
        tecnicosAPI.getAll(),
        500 // 500ms mínimo para o spinner
      );
      setAllTecnicos(response.data.filter(t => t.ativo));
    } catch (err) {
      console.error('Erro ao carregar técnicos:', err);
    } finally {
      setLoadingTecnicos(false);
    }
  };

  const loadEquipe = async () => {
    try {
      const response = await atendimentosAPI.getByOrdemServico(os.id);
      setEquipe(response.data);
    } catch (err) {
      console.error('Erro ao carregar equipe:', err);
    }
  };

  const handleAddTecnico = async (tecnico: Tecnico) => {
    try {
      setSaving(true);
      setError(null);
      
      // Verificar se já está na equipe
      if (equipe.some(a => a.tecnicoId === tecnico.id)) {
        setError('Este técnico já está na equipe');
        return;
      }

      const response = await withMinDelay(
        atendimentosAPI.create({
          ordemServicoId: os.id,
          tecnicoId: tecnico.id,
          status: 'pendente',
        }),
        300 // 300ms mínimo para feedback
      );

      setEquipe([...equipe, { ...response.data, tecnico }]);
      setSearchTerm('');
    } catch (err: any) {
      setError(err.userMessage || 'Erro ao adicionar técnico');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTecnico = async (atendimentoId: number) => {
    try {
      setSaving(true);
      setError(null);
      
      await withMinDelay(
        atendimentosAPI.delete(atendimentoId),
        300 // 300ms mínimo para feedback
      );
      
      setEquipe(equipe.filter(a => a.id !== atendimentoId));
    } catch (err: any) {
      setError(err.userMessage || 'Erro ao remover técnico');
    } finally {
      setSaving(false);
    }
  };

  // Obter lista única de especialidades
  const especialidades = Array.from(new Set(allTecnicos.map(t => t.especialidade).filter(Boolean)));

  const filteredTecnicos = (() => {
    // Se digitou @, mostra todos (sem necessidade de 3 caracteres)
    const showAll = searchTerm.trim() === '@';
    const searchText = searchTerm.startsWith('@') ? searchTerm.substring(1).trim() : searchTerm;
    
    // Precisa ter @ OU 3+ caracteres
    if (!showAll && searchText.length < 3) return [];

    return allTecnicos.filter(t => {
      // Não mostrar quem já está na equipe
      if (equipe.some(a => a.tecnicoId === t.id)) return false;
      
      // Aplicar filtro de especialidade
      if (filterEspecialidade !== 'todas' && t.especialidade !== filterEspecialidade) return false;
      
      // Se é @, já passou nos filtros acima
      if (showAll && searchText.length === 0) return true;
      
      // Busca por texto no nome ou especialidade
      const searchLower = searchText.toLowerCase();
      return t.nome.toLowerCase().includes(searchLower) ||
             t.especialidade?.toLowerCase().includes(searchLower);
    });
  })();

  const handleSaveField = async (field: EditingField) => {
    if (!field) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const dataToUpdate: any = {};
      if (field === 'nomeCliente') dataToUpdate.nomeCliente = formData.nomeCliente;
      if (field === 'nomeEvento') dataToUpdate.nomeEvento = formData.nomeEvento;
      if (field === 'data') dataToUpdate.data = new Date(formData.data).toISOString();
      
      const response = await withMinDelay(
        ordensServicoAPI.update(os.id, dataToUpdate),
        400 // 400ms mínimo para feedback visual
      );
      
      setEditingField(null);
      onUpdate?.(response.data);
    } catch (err: any) {
      setError(err.userMessage || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = (field: EditingField) => {
    if (field === 'nomeCliente') setFormData(prev => ({ ...prev, nomeCliente: os.nomeCliente }));
    if (field === 'nomeEvento') setFormData(prev => ({ ...prev, nomeEvento: os.nomeEvento }));
    if (field === 'data') setFormData(prev => ({ ...prev, data: new Date(os.data).toISOString().split('T')[0] }));
    setEditingField(null);
    setError(null);
  };

  const pdfUrl = ordensServicoAPI.getPdfUrl(os.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>OS #{os.numeroOS}</h2>
          <div className="modal-actions">
            {currentView === 'details' && (
              <>
                <button className="action-btn team-btn" onClick={() => setCurrentView('team')}>
                  👥 Escalar Equipe
                </button>
                <button className="action-btn pdf-btn" onClick={() => setCurrentView('pdf')}>
                  📄 Ver PDF
                </button>
              </>
            )}
            {currentView !== 'details' && (
              <button className="action-btn back-btn" onClick={() => setCurrentView('details')}>
                ← Voltar aos Detalhes
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {currentView === 'pdf' ? (
          <div className="pdf-viewer">
            <iframe
              src={pdfUrl}
              className="pdf-frame"
              title={`PDF - ${os.nomeArquivo}`}
            />
          </div>
        ) : currentView === 'team' ? (
          <div className="team-view">
            <h3>Equipe Escalada</h3>
            
            {/* Filtro de especialidade */}
            <div className="filter-container">
              <label htmlFor="especialidade-filter">Filtrar por especialidade:</label>
              <select 
                id="especialidade-filter"
                value={filterEspecialidade}
                onChange={(e) => setFilterEspecialidade(e.target.value)}
                className="especialidade-filter"
              >
                <option value="todas">Todas as especialidades</option>
                {especialidades.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>
            
            {/* Search input */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Digite 3+ caracteres ou @ para listar todos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tech-search-input"
              />
            </div>

            {/* Dropdown with filtered results */}
            {(searchTerm.trim() === '@' || searchTerm.length >= 3) && filteredTecnicos.length > 0 && (
              <div className="tech-dropdown">
                {filteredTecnicos.map(tec => (
                  <div 
                    key={tec.id}
                    className="tech-option"
                    onClick={() => handleAddTecnico(tec)}
                  >
                    <div className="tech-name">{tec.nome}</div>
                    <div className="tech-specialty">{tec.especialidade || 'Sem especialidade'}</div>
                  </div>
                ))}
              </div>
            )}

            {loadingTecnicos && (
              <Spinner size="medium" message="Carregando técnicos..." />
            )}

            {/* Current team */}
            <div className="current-team">
              <h4>Técnicos na Equipe ({equipe.length})</h4>
              {equipe.length === 0 ? (
                <p className="empty-message">Nenhum técnico escalado ainda.</p>
              ) : (
                <div className="team-list">
                  {equipe.map(atendimento => (
                    <div key={atendimento.id} className="team-member">
                      <div className="member-info">
                        <div className="member-name">{atendimento.tecnico?.nome || 'Nome indisponível'}</div>
                        <div className="member-specialty">{atendimento.tecnico?.especialidade || 'Sem especialidade'}</div>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveTecnico(atendimento.id)}
                        title="Remover técnico"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="modal-body">
            {/* Cliente */}
            <div className="detail-row">
              <div className="field-header">
                <strong>Cliente</strong>
                {editingField !== 'nomeCliente' && (
                  <button 
                    className="edit-icon-btn"
                    onClick={() => setEditingField('nomeCliente')}
                    title="Editar cliente"
                  >
                    ✏️
                  </button>
                )}
              </div>
              {editingField === 'nomeCliente' ? (
                <div className="edit-field">
                  <input
                    type="text"
                    className="touch-input"
                    value={formData.nomeCliente}
                    onChange={(e) => setFormData({ ...formData, nomeCliente: e.target.value })}
                    placeholder="Nome do cliente"
                    autoFocus
                  />
                  <div className="field-actions">
                    <button 
                      className="field-btn save-btn"
                      onClick={() => handleSaveField('nomeCliente')}
                      disabled={saving}
                    >
                      ✓
                    </button>
                    <button 
                      className="field-btn cancel-btn"
                      onClick={() => handleCancelEdit('nomeCliente')}
                      disabled={saving}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <span>{os.nomeCliente}</span>
              )}
            </div>

            {/* Evento */}
            <div className="detail-row">
              <div className="field-header">
                <strong>Evento</strong>
                {editingField !== 'nomeEvento' && (
                  <button 
                    className="edit-icon-btn"
                    onClick={() => setEditingField('nomeEvento')}
                    title="Editar evento"
                  >
                    ✏️
                  </button>
                )}
              </div>
              {editingField === 'nomeEvento' ? (
                <div className="edit-field">
                  <input
                    type="text"
                    className="touch-input"
                    value={formData.nomeEvento}
                    onChange={(e) => setFormData({ ...formData, nomeEvento: e.target.value })}
                    placeholder="Nome do evento"
                    autoFocus
                  />
                  <div className="field-actions">
                    <button 
                      className="field-btn save-btn"
                      onClick={() => handleSaveField('nomeEvento')}
                      disabled={saving}
                    >
                      ✓
                    </button>
                    <button 
                      className="field-btn cancel-btn"
                      onClick={() => handleCancelEdit('nomeEvento')}
                      disabled={saving}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <span>{os.nomeEvento}</span>
              )}
            </div>

            {/* Data */}
            <div className="detail-row">
              <div className="field-header">
                <strong>Data</strong>
                {editingField !== 'data' && (
                  <button 
                    className="edit-icon-btn"
                    onClick={() => setEditingField('data')}
                    title="Editar data"
                  >
                    ✏️
                  </button>
                )}
              </div>
              {editingField === 'data' ? (
                <div className="edit-field">
                  <input
                    type="date"
                    className="touch-input"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    autoFocus
                  />
                  <div className="field-actions">
                    <button 
                      className="field-btn save-btn"
                      onClick={() => handleSaveField('data')}
                      disabled={saving}
                    >
                      ✓
                    </button>
                    <button 
                      className="field-btn cancel-btn"
                      onClick={() => handleCancelEdit('data')}
                      disabled={saving}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <span>{new Date(os.data).toLocaleDateString('pt-BR')}</span>
              )}
            </div>

            <div className="detail-row">
              <strong>Versão</strong>
              <span className="badge version-badge">v{os.versao}</span>
            </div>

            <div className="detail-row">
              <strong>Status</strong>
              <span className={`badge ${os.ativa ? 'active-badge' : 'inactive-badge'}`}>
                {os.ativa ? '✓ Ativa' : '✕ Inativa'}
              </span>
            </div>

            <div className="detail-row">
              <strong>Arquivo Original</strong>
              <span className="filename">{os.nomeArquivo}</span>
            </div>

            {os.caminhoRelativo && (
              <div className="detail-row">
                <strong>Localização</strong>
                <span className="filepath">{os.caminhoRelativo}</span>
              </div>
            )}

            {/* Equipe Escalada - Visualização */}
            {equipe.length > 0 && (
              <div className="detail-row equipe-section">
                <div className="field-header">
                  <strong>Equipe Escalada ({equipe.length})</strong>
                </div>
                <div className="team-list-readonly">
                  {equipe.map(atend => (
                    <div key={atend.id} className="team-member-readonly">
                      <div className="member-info">
                        <div className="member-name">
                          {atend.tecnico?.nome || `Técnico #${atend.tecnicoId}`}
                        </div>
                        {atend.tecnico?.especialidade && (
                          <div className="member-specialty-small">
                            {atend.tecnico.especialidade}
                          </div>
                        )}
                      </div>
                      <span className={`status-badge status-${atend.status}`}>
                        {atend.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
