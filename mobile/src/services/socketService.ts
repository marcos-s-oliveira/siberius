import { io, Socket } from 'socket.io-client';
import * as Notifications from 'expo-notifications';

const API_BASE_URL = 'http://192.168.100.101:3000';

class SocketService {
  private socket: Socket | null = null;
  private tecnicoId: number | null = null;
  private tecnicoNome: string | null = null;

  async initialize(tecnicoId: number, tecnicoNome: string) {
    this.tecnicoId = tecnicoId;
    this.tecnicoNome = tecnicoNome;

    // Configurar como as notificações devem ser exibidas
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificações de OS',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
    });

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Conectar ao socket
    this.socket = io(API_BASE_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket conectado:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket desconectado');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erro de conexão socket:', error.message);
    });

    // Escutar notificações de nova OS designada ao técnico
    this.socket.on('nova-ordem-designada', async (data: {
      atendimentoId: number;
      numeroOS: string;
      cliente: string;
      dataAgendamento: string;
      tecnicoId: number;
    }) => {
      console.log('📢 Nova ordem designada:', data);

      // Verificar se é para este técnico
      if (data.tecnicoId === this.tecnicoId) {
        const primeiroNome = this.tecnicoNome?.split(' ')[0] || 'Técnico';
        await this.showNotification(
          'Nova Ordem de Serviço',
          `Olá ${primeiroNome}, você foi designado para atender à O.S.: ${data.numeroOS}`
        );
      }
    });
  }

  private async showNotification(title: string, body: string) {
    try {
      // Solicitar permissão para notificações
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          console.log('Permissão de notificação negada');
          return;
        }
      }

      // Exibir notificação local
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // Imediatamente
      });

      console.log('📳 Notificação exibida:', title, body);
    } catch (error) {
      console.error('Erro ao exibir notificação:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.tecnicoId = null;
      console.log('Socket desconectado manualmente');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
