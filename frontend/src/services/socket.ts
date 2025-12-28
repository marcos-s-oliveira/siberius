import { io, Socket } from 'socket.io-client';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket já está conectado');
      return;
    }

    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('🔌 Conectado ao Socket.IO:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado do Socket.IO:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão Socket.IO:', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
