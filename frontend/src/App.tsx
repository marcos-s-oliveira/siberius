import { useState, useEffect } from 'react';
import WeeklyCalendar from './components/WeeklyCalendar';
import OSModal from './components/OSModal';
import ErrorScreen from './components/ErrorScreen';
import LoadingScreen from './components/LoadingScreen';
import { checkServerConnection } from './services/api';
import { socketService } from './services/socket';
import { ttsService } from './services/tts';
import { withMinDelay } from './utils/delay';
import type { OrdemServico } from './types';
import './App.css';

type AppState = 'loading' | 'connected' | 'error';

interface ErrorInfo {
  title: string;
  message: string;
  statusCode?: number;
}

function App() {
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [appState, setAppState] = useState<AppState>('loading');
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    checkConnection();
    
    // Carregar vozes do TTS
    ttsService.loadVoices().then(() => {
      console.log('🔊 TTS inicializado');
    });
  }, []);

  useEffect(() => {
    // Conectar ao Socket.IO quando o app estiver conectado
    if (appState === 'connected') {
      socketService.connect();

      // Ouvir eventos de nova ordem de serviço
      const handleNovaOS = (data: any) => {
        console.log('📢 Nova OS recebida:', data);
        
        // Falar notificação
        ttsService.speak(data.message);
        
        // Refresh do calendário para mostrar nova OS
        setRefreshTrigger(prev => prev + 1);
      };

      socketService.on('nova-ordem-servico', handleNovaOS);

      // Cleanup ao desmontar
      return () => {
        socketService.off('nova-ordem-servico', handleNovaOS);
      };
    }
  }, [appState]);

  const checkConnection = async () => {
    setAppState('loading');
    setErrorInfo(null);

    try {
      const result = await withMinDelay(
        checkServerConnection(),
        1000 // 1s mínimo para tela de loading inicial
      );
      
      if (result.connected) {
        setAppState('connected');
      } else {
        setAppState('error');
        setErrorInfo({
          title: 'Servidor Offline',
          message: result.error || 'Não foi possível conectar ao servidor backend. Verifique se o servidor está rodando.',
        });
      }
    } catch (error: any) {
      setAppState('error');
      setErrorInfo({
        title: 'Erro de Conexão',
        message: error.userMessage || 'Ocorreu um erro ao tentar conectar ao servidor.',
      });
    }
  };

  const handleOSUpdate = (updatedOS: OrdemServico) => {
    setSelectedOS(updatedOS);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh no calendário
  };

  if (appState === 'loading') {
    return <LoadingScreen message="Conectando ao servidor..." />;
  }

  if (appState === 'error' && errorInfo) {
    return (
      <ErrorScreen
        title={errorInfo.title}
        message={errorInfo.message}
        statusCode={errorInfo.statusCode}
        onRetry={checkConnection}
      />
    );
  }

  return (
    <div className="app">
      <WeeklyCalendar onSelectOS={setSelectedOS} refreshTrigger={refreshTrigger} />
      
      {selectedOS && (
        <OSModal 
          os={selectedOS} 
          onClose={() => setSelectedOS(null)}
          onUpdate={handleOSUpdate}
        />
      )}
    </div>
  );
}

export default App;
