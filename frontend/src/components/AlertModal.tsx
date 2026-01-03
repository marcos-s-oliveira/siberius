import React from 'react';
import Modal from './Modal';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
}

/**
 * Modal de alerta customizado
 * NUNCA USE window.alert() - sempre use este componente!
 */
function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
}: AlertModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small" showCloseButton={false}>
      <div style={{ padding: '10px 0', textAlign: 'center' }}>
        <div
          style={{
            fontSize: '48px',
            marginBottom: '16px',
            color: getIconColor(),
          }}
        >
          {getIcon()}
        </div>

        <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
          {message}
        </p>

        <button
          className="btn-primary"
          onClick={onClose}
          style={{ minWidth: '120px' }}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
}

export default AlertModal;
