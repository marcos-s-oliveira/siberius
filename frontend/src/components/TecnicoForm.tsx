import { useState } from 'react';
import { tecnicosAPI } from '../services/api';
import type { Tecnico } from '../types';
import './Form.css';

interface TecnicoFormProps {
  tecnico: Tecnico | null;
  onSave: () => void;
  onCancel: () => void;
}

function TecnicoForm({ tecnico, onSave, onCancel }: TecnicoFormProps) {
  const [formData, setFormData] = useState({
    nome: tecnico?.nome || '',
    email: tecnico?.email || '',
    telefone: tecnico?.telefone || '',
    especialidade: tecnico?.especialidade || '',
    ativo: tecnico?.ativo ?? true,
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
    setLoading(true);
    setError(null);

    try {
      if (tecnico) {
        await tecnicosAPI.update(tecnico.id, formData);
      } else {
        await tecnicosAPI.create(formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.userMessage || 'Erro ao salvar técnico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{tecnico ? 'Editar' : 'Novo'} Técnico</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="nome">Nome *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="especialidade">Especialidade</label>
          <input
            type="text"
            id="especialidade"
            name="especialidade"
            value={formData.especialidade}
            onChange={handleChange}
            placeholder="Ex: Áudio, Vídeo, Iluminação..."
          />
          <small>Para múltiplas especialidades, separe-as por vírgula</small>
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
            />
            <span>Ativo</span>
          </label>
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

export default TecnicoForm;
