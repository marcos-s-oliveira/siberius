import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginModal.css';

interface LoginFullModalProps {
  onClose?: () => void;
  onSuccess: () => void;
  required?: boolean;
}

function LoginFullModal({ onClose, onSuccess, required = false }: LoginFullModalProps) {
  const { loginWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !senha) {
      setError('Preencha email e senha');
      return;
    }

    try {
      setLoading(true);
      await loginWithPassword(email, senha);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={required ? undefined : onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔒 Autenticação Completa</h2>
          {!required && onClose && (
            <button className="modal-close" onClick={onClose}>×</button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}

          {required && (
            <div className="alert alert-info">
              Esta funcionalidade requer autenticação completa com email e senha.
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              className="form-input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              required
            />
          </div>

          <div className="modal-actions">
            {!required && onClose && (
              <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="login-info">
            <p>⏱️ Sessão válida por 12 horas</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginFullModal;
