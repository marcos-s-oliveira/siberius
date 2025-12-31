import React from 'react';
import './SyncProgressBar.css';

interface SyncProgressBarProps {
  show: boolean;
  processed: number;
  total: number;
  percentage: number;
  message: string;
}

const SyncProgressBar: React.FC<SyncProgressBarProps> = ({
  show,
  processed,
  total,
  percentage,
  message
}) => {
  if (!show) return null;

  return (
    <div className="sync-progress-container">
      <div className="sync-progress-content">
        <div className="sync-message">{message}</div>
        
        <div className="sync-progress-bar-wrapper">
          <div 
            className="sync-progress-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="sync-progress-stats">
          <span className="sync-count">{processed} / {total}</span>
          <span className="sync-percentage">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export default SyncProgressBar;
