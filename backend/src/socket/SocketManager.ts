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
      month: '2-digit',
      year: 'numeric' 
    });

    // Limitar caracteres para notificação
    const clienteLimitado = data.cliente.substring(0, 20);
    const eventoLimitado = data.evento.substring(0, 30);

    this.io.emit('nova-ordem-servico', {
      numeroOS: data.numeroOS,
      dataFormatted: dateFormatted,
      cliente: clienteLimitado,
      evento: eventoLimitado,
      message: `OS ${data.numeroOS} - ${clienteLimitado}`
    });

    logger.log(`📢 Notificação enviada: Nova OS #${data.numeroOS} - ${clienteLimitado}`);
  }

  /**
   * Emite notificação de ordem designada a um técnico específico
   */
  public notifyNewOrdemDesignada(data: { 
    atendimentoId: number;
    numeroOS: string; 
    cliente: string; 
    dataAgendamento: Date;
    tecnicoId: number;
  }): void {
    const dateFormatted = data.dataAgendamento.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    this.io.emit('nova-ordem-designada', {
      atendimentoId: data.atendimentoId,
      numeroOS: data.numeroOS,
      cliente: data.cliente,
      dataAgendamento: dateFormatted,
      tecnicoId: data.tecnicoId
    });

    logger.log(`📱 Notificação mobile enviada: OS #${data.numeroOS} designada ao técnico ${data.tecnicoId}`);
  }

  /**
   * Notifica início da sincronização de arquivos
   */
  public notifySyncStarted(totalFiles?: number): void {
    this.io.emit('sync-status', {
      status: 'syncing',
      message: 'Sincronizando arquivos...',
      totalFiles: totalFiles || 0,
      processedFiles: 0
    });
  }

  /**
   * Notifica progresso da sincronização
   */
  public notifySyncProgress(processed: number, total: number, currentFile?: string): void {
    const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
    
    this.io.emit('sync-progress', {
      processed,
      total,
      percentage,
      currentFile: currentFile || '',
      message: `Processando ${processed}/${total} arquivos...`
    });
  }

  /**
   * Notifica conclusão da sincronização
   */
  public notifySyncCompleted(stats?: { newFiles: number; alreadyIndexed: number; errors: number }): void {
    const now = new Date();
    const timestamp = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    this.io.emit('sync-status', {
      status: 'completed',
      message: `Sincronizado em: ${timestamp}`,
      timestamp: now,
      stats
    });
  }

  public getIO(): Server {
    return this.io;
  }
}
