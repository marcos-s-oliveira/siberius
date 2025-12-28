import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../utils/logger';

export class SocketManager {
  private io: Server;

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    this.io.on('connection', (socket) => {
      logger.log(`🔌 Cliente conectado: ${socket.id}`);

      socket.on('disconnect', () => {
        logger.log(`🔌 Cliente desconectado: ${socket.id}`);
      });
    });
  }

  /**
   * Emite notificação de nova ordem de serviço
   */
  public notifyNewOrdemServico(data: { numeroOS: string; data: Date; cliente: string; evento: string }): void {
    const dateFormatted = data.data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric' 
    });

    this.io.emit('nova-ordem-servico', {
      numeroOS: data.numeroOS,
      data: data.data,
      dataFormatted: dateFormatted,
      cliente: data.cliente,
      evento: data.evento,
      message: `Nova ordem de serviço para ${dateFormatted}`
    });

    logger.log(`📢 Notificação enviada: Nova OS #${data.numeroOS} para ${dateFormatted}`);
  }

  public getIO(): Server {
    return this.io;
  }
}
