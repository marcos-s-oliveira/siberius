/**
 * Script para executar um scan único de PDFs
 * Executa uma varredura imediata e depois encerra
 * Útil para execução manual ou via cron job
 */

import { PrismaClient } from '@prisma/client';
import { ConfigManager } from './config/ConfigManager';
import { PDFIndexer } from './indexer/PDFIndexer';
import { logger } from './utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  logger.log('═══════════════════════════════════════════════════════');
  logger.log('  🔍 Scan Único de PDFs');
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
    logger.log(`   📝 Logs detalhados: ${config.verboseLogging ? 'Sim' : 'Não'}\n`);

    logger.log('🔄 Iniciando scan único...\n');

    // Criar indexador sem modo contínuo
    const indexer = new PDFIndexer(prisma, configManager);
    
    // Executar scan uma única vez
    await indexer.scanOnce();

    logger.log('\n✅ Scan concluído com sucesso!');
    await prisma.$disconnect();
    process.exit(0);

  } catch (error) {
    logger.error('❌ Erro durante o scan:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
