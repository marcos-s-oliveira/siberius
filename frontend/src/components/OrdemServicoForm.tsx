import { useState } from 'react';
import { ordensServicoAPI } from '../services/api';
import type { OrdemServico } from '../types';
import './Form.css';

interface OrdemServicoFormProps {
  ordemServico: OrdemServico | null;
  onSave: () => void;
  onCancel: () => void;
}

function OrdemServicoForm({ ordemServico, onSave, onCancel }: OrdemServicoFormProps) {
  const [formData, setFormData] = useState({
    numeroOS: ordemServico?.numeroOS || '',
    versao: ordemServico?.versao || 1,
    nomeCliente: ordemServico?.nomeCliente || '',
    nomeEvento: ordemServico?.nomeEvento || '',
    data: ordemServico?.data ? ordemServico.data.split('T')[0] : '',
    dataMontagem: ordemServico?.dataMontagem ? ordemServico.dataMontagem.split('T')[0] : '',
    horarioMontagem: ordemServico?.horarioMontagem || '',
    caminhoArquivo: ordemServico?.caminhoArquivo || '',
    nomeArquivo: ordemServico?.nomeArquivo || '',
    ativa: ordemServico?.ativa ?? true,
    osAtualizada: ordemServico?.osAtualizada ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ordemServico) {
      alert('Apenas edição é suportada. Novas OS devem ser criadas via upload de PDF.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ordensServicoAPI.update(ordemServico.id, formData);
      onSave();
    } catch (err: any) {
      setError(err.userMessage || 'Erro ao salvar ordem de serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{ordemServico ? 'Editar' : 'Nova'} Ordem de Serviço</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {error && <div className="form-error">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="numeroOS">Número OS *</label>
            <input
              type="text"
              id="numeroOS"
              name="numeroOS"
              value={formData.numeroOS}
              onChange={handleChange}
              disabled={!!ordemServico}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="versao">Versão *</label>
            <input
              type="number"
              id="versao"
              name="versao"
              value={formData.versao}
              onChange={handleChange}
              disabled={!!ordemServico}
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="nomeCliente">Cliente *</label>
          <input
            type="text"
            id="nomeCliente"
            name="nomeCliente"
            value={formData.nomeCliente}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nomeEvento">Evento *</label>
          <input
            type="text"
            id="nomeEvento"
            name="nomeEvento"
            value={formData.nomeEvento}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="data">Data *</label>
          <input
            type="date"
            id="data"
            name="data"
            value={formData.data}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dataMontagem">Data da Montagem</label>
            <input
              type="date"
              id="dataMontagem"
              name="dataMontagem"
              value={formData.dataMontagem}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="horarioMontagem">Horário da Montagem</label>
            <input
              type="time"
              id="horarioMontagem"
              name="horarioMontagem"
              value={formData.horarioMontagem}
              onChange={handleChange}
              placeholder="HH:mm"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="caminhoArquivo">Caminho do Arquivo</label>
          <input
            type="text"
            id="caminhoArquivo"
            name="caminhoArquivo"
            value={formData.caminhoArquivo}
            onChange={handleChange}
            disabled
            style={{ backgroundColor: '#f5f5f5' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="nomeArquivo">Nome do Arquivo</label>
          <input
            type="text"
            id="nomeArquivo"
            name="nomeArquivo"
            value={formData.nomeArquivo}
            onChange={handleChange}
            disabled
            style={{ backgroundColor: '#f5f5f5' }}
          />
        </div>

        <div className="form-row">
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="ativa"
                checked={formData.ativa}
                onChange={handleChange}
              />
              <span>Ativa</span>
            </label>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="osAtualizada"
                checked={formData.osAtualizada}
                onChange={handleChange}
              />
              <span>OS Atualizada</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OrdemServicoForm;
