import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

export interface Config {
  pdfDirectory: string;
  checkIntervalMinutes: number;
  verboseLogging: boolean;
}

export class ConfigManager {
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    try {
      // Ler configurações do .env
      const pdfDirectory = process.env.PDF_DIRECTORY;
      const checkIntervalMinutes = parseInt(process.env.CHECK_INTERVAL_MINUTES || '10', 10);
      const verboseLogging = process.env.VERBOSE_LOGGING?.toLowerCase() === 'true';

      // Validar configurações obrigatórias
      if (!pdfDirectory) {
        throw new Error('PDF_DIRECTORY não está configurado no arquivo .env');
      }

      if (!fs.existsSync(pdfDirectory)) {
        throw new Error(`Diretório especificado não existe: ${pdfDirectory}`);
      }

      return {
        pdfDirectory,
        checkIntervalMinutes: checkIntervalMinutes || 10,
        verboseLogging: verboseLogging ?? true,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao carregar configuração: ${error.message}`);
      }
      throw error;
    }
  }

  public getConfig(): Config {
    return this.config;
  }

  public reloadConfig(): void {
    // Recarregar variáveis de ambiente
    dotenv.config();
    this.config = this.loadConfig();
  }
}
