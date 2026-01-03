/**
 * Script dedicado apenas ao servidor API
 * Serve apenas a API REST + WebSocket, sem indexação automática
 * Ideal para ambientes onde a indexação roda separadamente
 */

import { PrismaClient } from '@prisma/client';
import { ApiServer } from './api/ApiServer';
import { logger } from './utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  logger.log('═══════════════════════════════════════════════════════');
  logger.log('  🌐 Servidor API - Siberius');
  logger.log('═══════════════════════════════════════════════════════\n');

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    await prisma.$connect();
    logger.log('✅ Conectado ao banco de dados\n');

    // Iniciar apenas o servidor API
    const apiPort = parseInt(process.env.API_PORT || '3000');
    const apiServer = new ApiServer(apiPort);
    
    await apiServer.start();

    logger.log('⚙️  Modo: API standalone (sem indexação automática)');
    logger.log('📌 Para indexar PDFs, execute: npm run indexer\n');

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.log(`\n\n⚠️  Sinal ${signal} recebido. Encerrando...`);
      await apiServer.stop();
      await prisma.$disconnect();
      logger.log('👋 Servidor API finalizado\n');
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
