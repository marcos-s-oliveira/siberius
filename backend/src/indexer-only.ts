/**
 * Script dedicado apenas à indexação de PDFs
 * Roda de forma independente do servidor API
 * Ideal para execução via cron job ou schedule
 */

import { PrismaClient } from '@prisma/client';
import { ConfigManager } from './config/ConfigManager';
import { PDFIndexer } from './indexer/PDFIndexer';
import { logger } from './utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  logger.log('═══════════════════════════════════════════════════════');
  logger.log('  🔍 Indexador de PDFs - Modo Standalone');
  logger.log('═══════════════════════════════════════════════════════\n');

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    await prisma.$connect();
    logger.log('✅ Conectado ao banco de dados\n');

    const configManager = new ConfigManager();
    const config = configManager.getConfig();

    logger.log('⚙️  Configurações:');
    logger.log(`   📁 Diretório: ${config.pdfDirectory}`);
    logger.log(`   ⏱️  Intervalo: ${config.checkIntervalMinutes} minuto(s)`);
    logger.log(`   📝 Logs detalhados: ${config.verboseLogging ? 'Sim' : 'Não'}`);
    logger.log(`   🔄 Modo: Indexador standalone (sem API)\n`);

    // Criar indexador SEM socket manager (sem notificações real-time)
    const indexer = new PDFIndexer(prisma, configManager);
    indexer.start();

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.log(`\n\n⚠️  Sinal ${signal} recebido. Encerrando...`);
      indexer.stop();
      await prisma.$disconnect();
      logger.log('👋 Indexador finalizado\n');
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
