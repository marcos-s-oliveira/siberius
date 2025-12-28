import './ErrorScreen.css';

interface ErrorScreenProps {
  title: string;
  message: string;
  statusCode?: number;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorScreen({ 
  title, 
  message, 
  statusCode, 
  onRetry, 
  showRetry = true 
}: ErrorScreenProps) {
  
  const getIcon = () => {
    if (!statusCode) return '🔌';
    if (statusCode >= 500) return '⚠️';
    if (statusCode === 404) return '🔍';
    if (statusCode === 403) return '🔒';
    if (statusCode === 401) return '🔑';
    return '❌';
  };

  return (
    <div className="error-screen">
      <div className="error-container">
        <div className="error-icon">{getIcon()}</div>
        
        <h1 className="error-title">{title}</h1>
        
        {statusCode && (
          <div className="error-code">Código: {statusCode}</div>
        )}
        
        <p className="error-message">{message}</p>
        
        <div className="error-actions">
          {showRetry && onRetry && (
            <button className="error-button primary" onClick={onRetry}>
              🔄 Tentar Novamente
            </button>
          )}
          
          <button 
            className="error-button secondary" 
            onClick={() => window.location.reload()}
          >
            ↻ Recarregar Página
          </button>
        </div>
        
        <div className="error-tips">
          <h3>Possíveis soluções:</h3>
          <ul>
            <li>Verifique se o servidor backend está rodando na porta 3000</li>
            <li>Confirme se não há bloqueios de firewall</li>
            <li>Verifique sua conexão de rede</li>
            <li>Tente limpar o cache do navegador</li>
          </ul>
        </div>
        
        <div className="error-footer">
          <p>Se o problema persistir, contate o suporte técnico.</p>
        </div>
      </div>
    </div>
  );
}
