import express, { Application } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import cors from 'cors';
import { logger } from '../utils/logger';
import { SocketManager } from '../socket/SocketManager';
import { setupRoutes } from '../routes';

export class ApiServer {
  private app: Application;
  private port: number;
  private httpServer: HTTPServer;
  private socketManager: SocketManager | null = null;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.httpServer = createServer(this.app);
    this.setupMiddlewares();
  }

  private setupMiddlewares(): void {
    // CORS
    this.app.use(cors());

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      // Inicializar Socket.IO
      this.socketManager = new SocketManager(this.httpServer);
      
      // Configurar rotas com socket manager
      const routes = setupRoutes(this.socketManager);
      this.app.use(routes);
      
      this.httpServer.listen(this.port, () => {
        logger.log(`\n🚀 Servidor API rodando em http://localhost:${this.port}`);
        logger.log(`🔌 Socket.IO ativo e aguardando conexões`);
        logger.log(`💚 Health check: http://localhost:${this.port}/health`);
        logger.log(`📡 Endpoints disponíveis em: http://localhost:${this.port}/api\n`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.close(() => {
        logger.log('🛑 Servidor API encerrado');
        resolve();
      });
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public getSocketManager(): SocketManager | null {
    return this.socketManager;
  }
}
