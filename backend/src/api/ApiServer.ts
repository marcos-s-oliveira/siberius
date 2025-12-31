import express, { Application } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import cors from 'cors';
import routes from '../routes';
import { logger } from '../utils/logger';
import { SocketManager } from '../socket/SocketManager';

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
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    // CORS
    this.app.use(cors());

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.app.use(routes);
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      // Inicializar Socket.IO
      this.socketManager = new SocketManager(this.httpServer);
      
      this.httpServer.listen(this.port, () => {
        logger.log(`\n🚀 Servidor API rodando em http://localhost:${this.port}`);
        logger.log(`🔌 Socket.IO ativo e aguardando conexões`);
        logger.log(`💚 Health check: http://localhost:${this.port}/health`);
        logger.log(`📡 Endpoints disponíveis em: http://localhost:${this.port}/api\n`);
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
