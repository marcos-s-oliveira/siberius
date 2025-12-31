import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import './LoginModal.css';

interface LoginPinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function LoginPinModal({ onClose, onSuccess }: LoginPinModalProps) {
  const { loginWithPin } = useAuth();
  const [usuarios, setUsuarios] = useState<Array<{ id: number; nome: string }>>([]);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number>(0);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const response = await authAPI.getUsuarios();
      setUsuarios(response.data);
    } catch (err) {
      setError('Erro ao carregar usuários');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUsuarioId) {
      setError('Selecione um usuário');
      return;
    }

    if (!pin || pin.length < 4) {
      setError('Digite um PIN válido (4-6 dígitos)');
      return;
    }

    try {
      setLoading(true);
      await loginWithPin(selectedUsuarioId, pin);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'PIN inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔐 Login Rápido</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="usuario">Usuário</label>
            <select
              id="usuario"
              className="form-input"
              value={selectedUsuarioId}
              onChange={(e) => setSelectedUsuarioId(Number(e.target.value))}
              required
              autoFocus
            >
              <option value={0}>Selecione seu usuário</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pin">PIN</label>
            <input
              type="password"
              id="pin"
              className="form-input pin-input"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Digite seu PIN"
              maxLength={6}
              required
            />
            <small className="form-hint">Digite seu PIN de 4 a 6 dígitos</small>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="login-info">
            <p>⏱️ Sessão válida por 3 horas</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPinModal;
