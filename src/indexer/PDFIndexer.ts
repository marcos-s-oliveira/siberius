import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PDFParser, ParsedPDFInfo } from '../parser/PDFParser';
import { ConfigManager } from '../config/ConfigManager';
import { logger } from '../utils/logger';

export class PDFIndexer {
  private prisma: PrismaClient;
  private configManager: ConfigManager;
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(prisma: PrismaClient, configManager: ConfigManager) {
    this.prisma = prisma;
    this.configManager = configManager;
  }

  /**
   * Inicia o processo de indexação periódica
   */
  public start(): void {
    if (this.isRunning) {
      logger.log('⚠️  Indexador já está em execução');
      return;
    }

    this.isRunning = true;
    logger.log('🚀 Iniciando indexador de PDFs...');

    // Executar imediatamente a primeira vez
    this.scanAndIndex();

    // Configurar execução periódica
    const config = this.configManager.getConfig();
    const intervalMs = config.checkIntervalMinutes * 60 * 1000;

    this.checkInterval = setInterval(() => {
      this.scanAndIndex();
    }, intervalMs);

    logger.log(`⏰ Verificação agendada a cada ${config.checkIntervalMinutes} minutos`);
  }

  /**
   * Para o processo de indexação periódica
   */
  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    logger.log('🛑 Indexador parado');
  }

  /**
   * Escaneia o diretório e indexa novos arquivos
   */
  private async scanAndIndex(): Promise<void> {
    const config = this.configManager.getConfig();
    
    try {
      logger.log('\n📂 Escaneando diretório recursivamente:', config.pdfDirectory);
      
      const startTime = Date.now();
      const files = this.getPDFFiles(config.pdfDirectory);
      const scanDuration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      logger.log(`📄 ${files.length} arquivo(s) PDF encontrado(s) em ${scanDuration}s`);

      if (files.length === 0) {
        return;
      }

      let newFilesCount = 0;
      let alreadyIndexedCount = 0;
      let errorCount = 0;

      for (const file of files) {
        try {
          const wasNew = await this.indexFile(file);
          if (wasNew) {
            newFilesCount++;
          } else {
            alreadyIndexedCount++;
          }
        } catch (error) {
          errorCount++;
          logger.error(`❌ Erro ao indexar ${path.basename(file.filepath)}:`, error instanceof Error ? error.message : error);
        }
      }

      logger.log(`✅ Indexação concluída: ${newFilesCount} novo(s), ${alreadyIndexedCount} já indexado(s), ${errorCount} erro(s)`);
    } catch (error) {
      logger.error('❌ Erro durante escaneamento:', error);
    }
  }

  /**
   * Lista todos os arquivos PDF no diretório e subdiretórios (recursivo)
   */
  private getPDFFiles(directory: string): Array<{ filepath: string; filename: string }> {
    const files: Array<{ filepath: string; filename: string }> = [];

    const scanDirectory = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          try {
            if (entry.isDirectory()) {
              // Recursivamente escanear subdiretórios
              scanDirectory(fullPath);
            } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
              files.push({
                filepath: fullPath,
                filename: entry.name,
              });
            }
          } catch (error) {
            // Ignorar erros de acesso a arquivos/pastas individuais
            logger.error(`⚠️  Erro ao acessar: ${fullPath}`, error instanceof Error ? error.message : error);
          }
        }
      } catch (error) {
        logger.error(`❌ Erro ao ler diretório: ${dir}`, error instanceof Error ? error.message : error);
      }
    };

    scanDirectory(directory);
    return files;
  }

  /**
   * Indexa um arquivo PDF no banco de dados
   * @returns true se o arquivo foi novo, false se já existia
   */
  private async indexFile(file: { filepath: string; filename: string }): Promise<boolean> {
    const config = this.configManager.getConfig();

    // Verificar se já existe no banco
    const existing = await this.prisma.ordemServico.findUnique({
      where: { caminhoArquivo: file.filepath },
    });

    if (existing) {
      return false;
    }

    // Parse do nome do arquivo
    const parsedInfo = PDFParser.parseFilename(file.filename);

    // Calcular caminho relativo ao diretório base
    const caminhoRelativo = path.relative(config.pdfDirectory, file.filepath);

    // Verificar se já existe uma OS com o mesmo número
    const existingOSList = await this.prisma.ordemServico.findMany({
      where: { numeroOS: parsedInfo.numeroOS },
      orderBy: { versao: 'desc' },
    });

    let osOriginalId: number | undefined = undefined;
    let versao = 1;

    if (existingOSList.length > 0) {
      const latestOS = existingOSList[0];
      
      if (parsedInfo.osAtualizada) {
        // É uma OS atualizada, então é uma nova versão
        versao = latestOS.versao + 1;
        osOriginalId = existingOSList.find(os => os.versao === 1)?.id || latestOS.id;
        
        // Marcar versões anteriores como inativas
        await this.prisma.ordemServico.updateMany({
          where: { numeroOS: parsedInfo.numeroOS },
          data: { ativa: false },
        });
        
        logger.log(`📝 Nova versão (v${versao}) da OS ${parsedInfo.numeroOS}: ${file.filename}`);
      } else {
        // É uma OS com número duplicado, mas não marcada como atualizada
        logger.log(`⚠️  OS ${parsedInfo.numeroOS} já existe e não está marcada como 'O.S ATUALIZADA'. Pulando: ${file.filename}`);
        return false;
      }
    }

    // Salvar no banco de dados
    await this.prisma.ordemServico.create({
      data: {
        numeroOS: parsedInfo.numeroOS,
        versao: versao,
        nomeCliente: parsedInfo.nomeCliente,
        nomeEvento: parsedInfo.nomeEvento,
        data: parsedInfo.data,
        osAtualizada: parsedInfo.osAtualizada,
        caminhoArquivo: file.filepath,
        caminhoRelativo: caminhoRelativo,
        nomeArquivo: parsedInfo.nomeArquivo,
        osOriginalId: osOriginalId,
        ativa: true,
      },
    });

    if (config.verboseLogging) {
      logger.log(`✨ Novo arquivo indexado: ${file.filename} | OS: ${parsedInfo.numeroOS}`);
    }

    return true;
  }

  /**
   * Retorna o status atual do indexador
   */
  public getStatus(): { isRunning: boolean; config: any } {
    return {
      isRunning: this.isRunning,
      config: this.configManager.getConfig(),
    };
  }
}
