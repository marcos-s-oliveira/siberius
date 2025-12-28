import './Notification.css';

export interface NotificationData {
  id: string;
  numeroOS: string;
  data: Date;
  dataFormatted: string;
  cliente: string;
  evento: string;
  message: string;
}

interface NotificationProps {
  notification: NotificationData;
  onView: (numeroOS: string) => void;
  onDismiss: (id: string) => void;
}

export default function Notification({ notification, onView, onDismiss }: NotificationProps) {
  return (
    <div className="notification">
      <button 
        className="notification-close"
        onClick={() => onDismiss(notification.id)}
        title="Fechar"
      >
        ✕
      </button>

      <div className="notification-header">
        <div className="notification-icon">📋</div>
        <h3 className="notification-title">Nova Ordem de Serviço!</h3>
      </div>

      <div className="notification-body">
        <div className="notification-os">OS #{notification.numeroOS}</div>
        
        <div className="notification-details">
          <div className="notification-detail">
            <strong>Cliente:</strong> {notification.cliente}
          </div>
          <div className="notification-detail">
            <strong>Evento:</strong> {notification.evento}
          </div>
          <div className="notification-date">
            📅 {notification.dataFormatted}
          </div>
        </div>
      </div>

      <div className="notification-actions">
        <button 
          className="notification-btn primary"
          onClick={() => onView(notification.numeroOS)}
        >
          👁️ Ver Detalhes
        </button>
        <button 
          className="notification-btn secondary"
          onClick={() => onDismiss(notification.id)}
        >
          ✓ Dispensar
        </button>
      </div>
    </div>
  );
}
