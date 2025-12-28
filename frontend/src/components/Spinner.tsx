import './Spinner.css';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
}

export default function Spinner({ size = 'medium', color, message }: SpinnerProps) {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className="spinner" style={color ? { borderTopColor: color } : undefined}>
        <div className="spinner-circle"></div>
      </div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
}
