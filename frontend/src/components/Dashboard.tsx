import { useState } from 'react';
import DashboardHome from './DashboardHome';
import OrdemServicoList from './OrdemServicoList';
import TecnicoList from './TecnicoList';
import AtendimentoList from './AtendimentoList';
import UsuarioList from './UsuarioList';
import UserManual from './UserManual';
import './Dashboard.css';

type MenuOption = 'home' | 'ordens' | 'tecnicos' | 'atendimentos' | 'usuarios' | 'manual';

interface DashboardProps {
  onBack: () => void;
}

function Dashboard({ onBack }: DashboardProps) {
  const [selectedMenu, setSelectedMenu] = useState<MenuOption>('home');

  const renderContent = () => {
    switch (selectedMenu) {
      case 'home':
        return <DashboardHome />;
      case 'ordens':
        return <OrdemServicoList />;
      case 'tecnicos':
        return <TecnicoList />;
      case 'atendimentos':
        return <AtendimentoList />;
      case 'usuarios':
        return <UsuarioList />;
      case 'manual':
        return <UserManual />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <button className="btn-back" onClick={onBack}>
            ← Voltar
          </button>
        </div>
        
        <nav className="dashboard-menu">
          <button
            className={`menu-item ${selectedMenu === 'home' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('home')}
          >
            <span className="menu-icon">🏠</span>
            Home
          </button>
          
          <button
            className={`menu-item ${selectedMenu === 'ordens' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('ordens')}
          >
            <span className="menu-icon">📋</span>
            Ordens de Serviço
          </button>
          
          <button
            className={`menu-item ${selectedMenu === 'tecnicos' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('tecnicos')}
          >
            <span className="menu-icon">👨‍🔧</span>
            Técnicos
          </button>
          
          <button
            className={`menu-item ${selectedMenu === 'atendimentos' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('atendimentos')}
          >
            <span className="menu-icon">🎯</span>
            Atendimentos
          </button>
          
          <button
            className={`menu-item ${selectedMenu === 'usuarios' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('usuarios')}
          >
            <span className="menu-icon">👥</span>
            Usuários
          </button>
          
          <button
            className={`menu-item manual-link ${selectedMenu === 'manual' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('manual')}
          >
            <span className="menu-icon">📚</span>
            Manual do Usuário
          </button>
        </nav>
      </aside>
      
      <main className="dashboard-content">
        <div className="mobile-header">
          <button className="btn-back-mobile" onClick={onBack}>
            ← Voltar
          </button>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}

export default Dashboard;
