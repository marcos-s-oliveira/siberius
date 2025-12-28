import express, { Application } from 'express';
import cors from 'cors';
import routes from '../routes';
import { logger } from '../utils/logger';

export class ApiServer {
  private app: Application;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
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

  public start(): void {
    this.app.listen(this.port, () => {
      logger.log(`\n🚀 Servidor API rodando em http://localhost:${this.port}`);
      logger.log(`📝 Health check: http://localhost:${this.port}/health`);
      logger.log(`📚 Endpoints disponíveis em: http://localhost:${this.port}/api\n`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
