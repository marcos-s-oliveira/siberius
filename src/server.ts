import { PrismaClient } from '@prisma/client';
import { ConfigManager } from './config/ConfigManager';
import { PDFIndexer } from './indexer/PDFIndexer';
import { ApiServer } from './api/ApiServer';
import { logger } from './utils/logger';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function main() {
  logger.log('═══════════════════════════════════════════════════════');
  logger.log('  🔍 Sistema de Indexação de PDFs - Siberius');
  logger.log('═══════════════════════════════════════════════════════\n');

  // Inicializar Prisma
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    // Testar conexão com o banco
    await prisma.$connect();
    logger.log('✅ Conectado ao banco de dados\n');

    // Iniciar servidor API
    const apiPort = parseInt(process.env.API_PORT || '3000');
    const apiServer = new ApiServer(apiPort);
    apiServer.start();

    // Carregar configuração para indexador
    const configManager = new ConfigManager();
    const config = configManager.getConfig();

    logger.log('⚙️  Configurações do indexador:');
    logger.log(`   📁 Diretório: ${config.pdfDirectory}`);
    logger.log(`   ⏱️  Intervalo: ${config.checkIntervalMinutes} minuto(s)`);
    logger.log(`   📝 Logs detalhados: ${config.verboseLogging ? 'Sim' : 'Não'}\n`);

    // Criar e iniciar o indexador
    const indexer = new PDFIndexer(prisma, configManager);
    indexer.start();

    // Lidar com sinais de término
    const gracefulShutdown = async (signal: string) => {
      logger.log(`\n\n⚠️  Sinal ${signal} recebido. Encerrando graciosamente...`);
      indexer.stop();
      await prisma.$disconnect();
      logger.log('👋 Até logo!\n');
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    logger.error('❌ Erro fatal:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
