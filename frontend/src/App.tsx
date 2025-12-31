import { useState, useEffect, useRef } from 'react';
import WeeklyCalendar from './components/WeeklyCalendar';
import OSModal from './components/OSModal';
import ErrorScreen from './components/ErrorScreen';
import LoadingScreen from './components/LoadingScreen';
import Notification, { NotificationData } from './components/Notification';
import Dashboard from './components/Dashboard';
import SyncProgressBar from './components/SyncProgressBar';
import LoginPinModal from './components/LoginPinModal';
import LoginFullModal from './components/LoginFullModal';
import { useAuth } from './contexts/AuthContext';
import { checkServerConnection, ordensServicoAPI } from './services/api';
import { socketService } from './services/socket';
import { ttsService } from './services/tts';
import { withMinDelay } from './utils/delay';
import type { OrdemServico } from './types';
import './App.css';

type AppState = 'loading' | 'connected' | 'error';
type ViewMode = 'calendar' | 'dashboard';

interface ErrorInfo {
  title: string;
  message: string;
  statusCode?: number;
}

interface SyncProgress {
  show: boolean;
  processed: number;
  total: number;
  percentage: number;
  message: string;
}

function App() {
  const { isAuthenticated, hasFullAuth } = useAuth();
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [appState, setAppState] = useState<AppState>('loading');
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [onAddOS, setOnAddOS] = useState<((numeroOS: string) => Promise<void>) | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    show: false,
    processed: 0,
    total: 0,
    percentage: 0,
    message: 'Sincronizando...'
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingOS, setPendingOS] = useState<OrdemServico | null>(null);
  const hideProgressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      // Sistema de agrupamento de notificações
      let pendingNotifications: any[] = [];
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      // Ouvir eventos de nova ordem de serviço
      const handleNovaOS = (data: any) => {
        console.log('📢 Nova OS recebida:', data);
        
        // Adicionar à fila de notificações pendentes
        pendingNotifications.push(data);
        
        // Limpar timer anterior
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        // Aguardar 500ms sem novas notificações antes de processar
        debounceTimer = setTimeout(async () => {
          const count = pendingNotifications.length;
          
          if (count > 20) {
            // Muitas notificações: mostrar apenas uma resumida e fazer refresh completo
            console.log(`⚠️ ${count} notificações recebidas - agrupando e forçando reload`);
            
            const notification: NotificationData = {
              id: `batch-${Date.now()}`,
              numeroOS: 'LOTE',
              data: new Date(),
              dataFormatted: new Date().toLocaleDateString('pt-BR'),
              cliente: `${count} novas ordens`,
              evento: 'Sincronização em massa',
              message: `${count} novas ordens de serviço indexadas`
            };
            
            setNotifications(prev => [...prev, notification]);
            ttsService.speak(`${count} novas ordens de serviço indexadas`);
            
            // Refresh completo do calendário
            const newTrigger = Date.now();
            console.log('🔄 Disparando refresh do calendário:', newTrigger);
            setRefreshTrigger(newTrigger);
          } else {
            // Processar notificações normalmente e adicionar OSs sem reload
            console.log(`✅ Processando ${count} notificações - adicionando sem reload`);
            
            for (const notifData of pendingNotifications) {
              ttsService.speak(notifData.message);
              
              const notification: NotificationData = {
                id: `${notifData.numeroOS}-${Date.now()}`,
                numeroOS: notifData.numeroOS,
                data: new Date(notifData.data),
                dataFormatted: notifData.dataFormatted,
                cliente: notifData.cliente,
                evento: notifData.evento,
                message: notifData.message
              };
              
              setNotifications(prev => [...prev, notification]);
              
              // Adicionar diretamente ao calendário sem reload
              if (onAddOS) {
                await onAddOS(notifData.numeroOS);
              }
            }
          }
          
          // Limpar fila
          pendingNotifications = [];
        }, 500);
      };

      socketService.on('nova-ordem-servico', handleNovaOS);

      // Ouvir eventos de progresso de sincronização
      const handleSyncStatus = (data: any) => {
        console.log('📊 Status de sincronização:', data);
        
        // Limpar timeout anterior se existir
        if (hideProgressTimeoutRef.current) {
          clearTimeout(hideProgressTimeoutRef.current);
          hideProgressTimeoutRef.current = null;
        }
        
        if (data.status === 'syncing') {
          setSyncProgress({
            show: true,
            processed: 0,
            total: data.totalFiles || 0,
            percentage: 0,
            message: data.message || 'Sincronizando...'
          });
        } else if (data.status === 'completed') {
          // Atualizar para 100% antes de ocultar
          setSyncProgress(prev => ({
            ...prev,
            processed: prev.total,
            percentage: 100,
            message: 'Sincronização concluída!'
          }));
          
          // Manter visível por 3 segundos antes de ocultar
          hideProgressTimeoutRef.current = setTimeout(() => {
            setSyncProgress(prev => ({ ...prev, show: false }));
            hideProgressTimeoutRef.current = null;
          }, 3000);
        }
      };

      const handleSyncProgress = (data: any) => {
        console.log('📈 Progresso:', data);
        setSyncProgress({
          show: true,
          processed: data.processed || 0,
          total: data.total || 0,
          percentage: data.percentage || 0,
          message: data.message || 'Processando...'
        });
      };

      socketService.on('sync-status', handleSyncStatus);
      socketService.on('sync-progress', handleSyncProgress);

      // Cleanup ao desmontar
      return () => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        socketService.off('nova-ordem-servico', handleNovaOS);
        socketService.off('sync-status', handleSyncStatus);
        socketService.off('sync-progress', handleSyncProgress);
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
    // Usar timestamp para garantir que sempre mude
    const newTrigger = Date.now();
    console.log('🔄 OS atualizada, disparando refresh do calendário:', newTrigger);
    setRefreshTrigger(newTrigger);
  };

  const handleViewNotification = async (numeroOS: string) => {
    try {
      // Se for notificação em lote, apenas remover
      if (numeroOS === 'LOTE') {
        setNotifications(prev => prev.filter(n => n.numeroOS !== numeroOS));
        return;
      }
      
      console.log('🔍 Buscando OS:', numeroOS);
      
      // Buscar a OS pelo número
      const response = await ordensServicoAPI.getByNumero(numeroOS);
      console.log('📦 Resposta da API:', response.data);
      
      if (response.data && response.data.length > 0) {
        // Pegar a versão mais recente (ativa)
        const os = response.data.find(os => os.ativa) || response.data[0];
        console.log('✅ OS encontrada:', os);
        
        // Buscar dados completos com atendimentos
        const fullOS = await ordensServicoAPI.getById(os.id);
        console.log('📋 OS completa:', fullOS.data);
        
        setSelectedOS(fullOS.data);
        
        // Remover a notificação
        setNotifications(prev => prev.filter(n => n.numeroOS !== numeroOS));
      } else {
        console.warn('⚠️ OS não encontrada:', numeroOS);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar OS:', error);
    }
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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

  if (viewMode === 'dashboard') {
    // Verificar se precisa de autenticação completa para dashboard
    if (!hasFullAuth) {
      return (
        <>
          <Dashboard onBack={() => setViewMode('calendar')} />
          <LoginFullModal
            required
            onSuccess={() => window.location.reload()}
            onClose={undefined}
          />
        </>
      );
    }
    return <Dashboard onBack={() => setViewMode('calendar')} />;
  }

  const handleSelectOS = (os: OrdemServico) => {
    // Se não estiver autenticado, mostrar modal de PIN
    if (!isAuthenticated) {
      setPendingOS(os);
      setShowPinModal(true);
    } else {
      setSelectedOS(os);
    }
  };

  const handlePinLoginSuccess = () => {
    setShowPinModal(false);
    if (pendingOS) {
      setSelectedOS(pendingOS);
      setPendingOS(null);
    }
  };

  return (
    <div className="app">
      <WeeklyCalendar 
        onSelectOS={handleSelectOS} 
        refreshTrigger={refreshTrigger}
        onRegisterAddOS={setOnAddOS}
      />
      
      {/* Botão flutuante para abrir dashboard */}
      <button 
        className="btn-dashboard-fab" 
        onClick={() => setViewMode('dashboard')}
        title="Abrir Dashboard"
      >
        ⚙️
      </button>
      
      {selectedOS && (
        <OSModal 
          os={selectedOS} 
          onClose={() => setSelectedOS(null)}
          onUpdate={handleOSUpdate}
        />
      )}

      {/* Notificações flutuantes */}
      {notifications.length > 0 && (
        <>
          <div className="notification-container">
            {notifications.map(notification => (
              <Notification
                key={notification.id}
                notification={notification}
                onView={handleViewNotification}
                onDismiss={handleDismissNotification}
              />
            ))}
          </div>
          
          {/* Botão para limpar todas as notificações */}
          <button
            className="btn-clear-notifications"
            onClick={() => setNotifications([])}
            title="Limpar todas as notificações"
          >
            ✕
          </button>
        </>
      )}

      {/* Barra de progresso de sincronização */}
      <SyncProgressBar 
        show={syncProgress.show}
        processed={syncProgress.processed}
        total={syncProgress.total}
        percentage={syncProgress.percentage}
        message={syncProgress.message}
      />

      {/* Modal de Login PIN */}
      {showPinModal && (
        <LoginPinModal
          onClose={() => {
            setShowPinModal(false);
            setPendingOS(null);
          }}
          onSuccess={handlePinLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;
