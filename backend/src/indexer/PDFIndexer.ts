import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PDFParser, ParsedPDFInfo } from '../parser/PDFParser';
import { ConfigManager } from '../config/ConfigManager';
import { logger } from '../utils/logger';
import { SocketManager } from '../socket/SocketManager';

export class PDFIndexer {
  private prisma: PrismaClient;
  private configManager: ConfigManager;
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private socketManager: SocketManager | null;
  private lastFileCount = 0;
  private filesCache: Set<string> = new Set();

  constructor(prisma: PrismaClient, configManager: ConfigManager, socketManager: SocketManager | null = null) {
    this.prisma = prisma;
    this.configManager = configManager;
    this.socketManager = socketManager;
    this.loadFilesCache();
  }

  /**
   * Carrega cache de nomes de arquivos do banco
   */
  private async loadFilesCache(): Promise<void> {
    try {
      const arquivos = await this.prisma.ordemServico.findMany({
        select: { nomeArquivo: true }
      });
      this.filesCache = new Set(arquivos.map(a => a.nomeArquivo));
      logger.log(`📦 Cache carregado: ${this.filesCache.size} arquivos`);
    } catch (error) {
      logger.error('Erro ao carregar cache:', error);
    }
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
      const startTime = Date.now();
      const files = this.getPDFFiles(config.pdfDirectory);
      const scanDuration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      // Otimização: Se número de arquivos não mudou, pular varredura
      if (files.length === this.lastFileCount && files.length > 0) {
        logger.log(`⏭️  Varredura pulada: ${files.length} arquivos (sem mudanças)`);
        return;
      }
      
      logger.log(`📂 ${files.length} PDFs encontrados (${scanDuration}s)`);
      this.lastFileCount = files.length;

      if (this.socketManager) {
        this.socketManager.notifySyncStarted(files.length);
      }

      if (files.length === 0) {
        if (this.socketManager) {
          this.socketManager.notifySyncCompleted({ newFiles: 0, alreadyIndexed: 0, errors: 0 });
        }
        return;
      }

      let newFilesCount = 0;
      let alreadyIndexedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Otimização: Verificar cache antes de processar
        if (this.filesCache.has(file.filename)) {
          alreadyIndexedCount++;
          continue;
        }
        
        try {
          const wasNew = await this.indexFile(file);
          if (wasNew) {
            newFilesCount++;
            this.filesCache.add(file.filename);
          } else {
            alreadyIndexedCount++;
          }
        } catch (error) {
          errorCount++;
          if (config.verboseLogging) {
            logger.error(`Erro: ${path.basename(file.filepath)}:`, error instanceof Error ? error.message : '');
          }
        }
        
        if (this.socketManager && i % 10 === 0) {
          this.socketManager.notifySyncProgress(i + 1, files.length, path.basename(file.filename));
        }
      }

      if (newFilesCount > 0 || errorCount > 0) {
        logger.log(`✅ Concluído: ${newFilesCount} novos, ${errorCount} erros`);
      }
      
      if (this.socketManager) {
        this.socketManager.notifySyncCompleted({
          newFiles: newFilesCount,
          alreadyIndexed: alreadyIndexedCount,
          errors: errorCount
        });
      }
    } catch (error) {
      logger.error('Erro na varredura:', error);
      if (this.socketManager) {
        this.socketManager.notifySyncCompleted({ newFiles: 0, alreadyIndexed: 0, errors: 1 });
      }
    }
  }

  /**
   * Calcula o hash MD5 de um arquivo para detectar duplicatas
   */
  private calculateFileHash(filepath: string): string {
    const fileBuffer = fs.readFileSync(filepath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
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

    // Otimização 1: Buscar por nome no banco ANTES de processar
    const existingByName = await this.prisma.ordemServico.findFirst({
      where: { nomeArquivo: file.filename },
      select: { id: true }
    });
    
    if (existingByName) {
      return false; // Já existe
    }

    // Otimização 2: Calcular hash apenas se não existe por nome
    const fileHash = this.calculateFileHash(file.filepath);
    
    const duplicateByHash = await this.prisma.ordemServico.findFirst({
      where: { fileHash: fileHash },
      select: { id: true }
    });
    
    if (duplicateByHash) {
      if (config.verboseLogging) {
        logger.log(`⚠️  Duplicado: ${file.filename}`);
      }
      return false;
    }

    // Verificar se já existe no banco pelo caminho
    const existing = await this.prisma.ordemServico.findUnique({
      where: { caminhoArquivo: file.filepath },
    });

    if (existing) {
      return false;
    }

    // Parse do conteúdo do PDF (com fallback para nome do arquivo)
    const parsedInfo = await PDFParser.parsePDFFile(file.filepath, file.filename);

    // Normalizar numeroOS removendo zeros à esquerda
    const numeroOSNormalizado = parsedInfo.numeroOS.replace(/^0+/, '') || '0';
    parsedInfo.numeroOS = numeroOSNormalizado;

    // Calcular caminho relativo ao diretório base
    const caminhoRelativo = path.relative(config.pdfDirectory, file.filepath);

    // Verificar se já existe uma OS com o mesmo número
    const existingOSList = await this.prisma.ordemServico.findMany({
      where: { numeroOS: numeroOSNormalizado },
      orderBy: { versao: 'desc' },
    });

    let osOriginalId: number | undefined = undefined;
    let versao = 1;

    if (existingOSList.length > 0) {
      const latestOS = existingOSList[0];
      
      // Verificar se já existe exatamente este mesmo arquivo (mesmo caminho)
      const exactPathMatch = existingOSList.find(os => os.caminhoArquivo === file.filepath);
      
      if (exactPathMatch) {
        logger.log(`⚠️  Arquivo já indexado: ${file.filename}`);
        return false;
      }
      
      if (parsedInfo.osAtualizada) {
        // É uma OS atualizada, então é uma nova versão
        versao = latestOS.versao + 1;
        osOriginalId = existingOSList.find(os => os.versao === 1)?.id || latestOS.id;
        
        // Marcar versões anteriores como inativas
        await this.prisma.ordemServico.updateMany({
          where: { numeroOS: numeroOSNormalizado },
          data: { ativa: false },
        });
        
        logger.log(`📝 Nova versão (v${versao}) da OS ${numeroOSNormalizado}: ${file.filename}`);
      } else {
        // É um arquivo diferente com o mesmo número de OS (evento ou cliente diferente)
        // Incrementar versão para evitar conflito de constraint única
        versao = latestOS.versao + 1;
        logger.log(`📋 Variação da OS ${numeroOSNormalizado} (v${versao}): ${file.filename}`);
      }
    }

    // Salvar no banco de dados
    try {
      const newOS = await this.prisma.ordemServico.create({
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
          fileHash: fileHash,
          ...(osOriginalId && { osOriginalId }),
          ativa: true,
        },
      });

      // Notificar via Socket.IO sobre nova OS
      if (this.socketManager) {
        this.socketManager.notifyNewOrdemServico({
          numeroOS: newOS.numeroOS,
          data: newOS.data,
          cliente: newOS.nomeCliente,
          evento: newOS.nomeEvento
        });
      }

      if (config.verboseLogging) {
        logger.log(`✨ Novo arquivo indexado: ${file.filename} | OS: ${parsedInfo.numeroOS}`);
      }

      return true;
    } catch (error) {
      logger.error(`❌ Erro ao salvar no banco de dados:`, error);
      logger.error(`Dados tentados:`, {
        numeroOS: parsedInfo.numeroOS,
        versao: versao,
        nomeCliente: parsedInfo.nomeCliente,
        nomeEvento: parsedInfo.nomeEvento,
        data: parsedInfo.data,
        osAtualizada: parsedInfo.osAtualizada,
        caminhoArquivo: file.filepath,
        nomeArquivo: parsedInfo.nomeArquivo
      });
      throw error;
    }
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
