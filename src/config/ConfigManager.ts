import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  pdfDirectory: string;
  checkIntervalMinutes: number;
  verboseLogging: boolean;
}

export class ConfigManager {
  private config: Config;
  private configPath: string;

  constructor(configPath: string = 'config.conf') {
    this.configPath = configPath;
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      const config: Partial<Config> = {};

      const lines = configContent.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Ignorar linhas vazias e comentários
        if (!trimmedLine || trimmedLine.startsWith('#')) {
          continue;
        }

        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').trim();

        switch (key.trim()) {
          case 'PDF_DIRECTORY':
            config.pdfDirectory = value;
            break;
          case 'CHECK_INTERVAL_MINUTES':
            config.checkIntervalMinutes = parseInt(value, 10);
            break;
          case 'VERBOSE_LOGGING':
            config.verboseLogging = value.toLowerCase() === 'true';
            break;
        }
      }

      // Validar configurações obrigatórias
      if (!config.pdfDirectory) {
        throw new Error('PDF_DIRECTORY não está configurado no arquivo config.conf');
      }

      if (!fs.existsSync(config.pdfDirectory)) {
        throw new Error(`Diretório especificado não existe: ${config.pdfDirectory}`);
      }

      return {
        pdfDirectory: config.pdfDirectory,
        checkIntervalMinutes: config.checkIntervalMinutes || 5,
        verboseLogging: config.verboseLogging ?? true,
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
    this.config = this.loadConfig();
  }
}
