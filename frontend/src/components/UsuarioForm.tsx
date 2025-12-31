import { useState } from 'react';
import { authAPI } from '../services/api';
import type { Usuario } from '../types';
import './Form.css';

interface UsuarioFormProps {
  usuario: Usuario | null;
  onSave: () => void;
  onCancel: () => void;
}

function UsuarioForm({ usuario, onSave, onCancel }: UsuarioFormProps) {
  const [formData, setFormData] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    senha: '',
    pin: usuario?.pin || '',
    ativo: usuario?.ativo ?? true,
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
      if (usuario) {
        await authAPI.updateUsuario(usuario.id, formData);
      } else {
        await authAPI.createUsuario(formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.userMessage || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{usuario ? 'Editar' : 'Novo'} Usuário</h2>
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
          <label htmlFor="senha">Senha {!usuario && '*'}</label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            placeholder={usuario ? 'Deixe em branco para não alterar' : ''}
            required={!usuario}
            minLength={6}
          />
          <small>Senha deve conter no mínimo 6 caracteres</small>
        </div>

        <div className="form-group">
          <label htmlFor="pin">PIN (opcional)</label>
          <input
            type="password"
            id="pin"
            name="pin"
            value={formData.pin}
            onChange={handleChange}
            placeholder="PIN de 4 a 6 dígitos para tela touch"
            maxLength={6}
            pattern="[0-9]{4,6}"
            title="PIN deve conter 4 a 6 dígitos"
          />
          <small>PIN opcional de 4 a 6 dígitos para login rápido</small>
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

export default UsuarioForm;
