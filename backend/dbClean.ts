/**
 * Script de limpeza do banco de dados
 * 1. Remove registros de Ordens de Serviço com data superior a 2026
 * 2. Escaneia arquivos PDF e remove registros que não são mais OS válidas
 * ATENÇÃO: Este script NUNCA exclui arquivos físicos, apenas registros do banco
 */

import { PrismaClient } from '@prisma/client';
import { PDFParser } from './src/parser/PDFParser';
import { ConfigManager } from './src/config/ConfigManager';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🧹 Limpeza do Banco de Dados - Siberius');
  console.log('═══════════════════════════════════════════════════════\n');

  let totalDeleted = 0;

  try {
    // ====== PARTE 1: Remover registros com data > 2026 ======
    console.log('📅 ETAPA 1: Verificando registros com data > 2026...\n');

    const maxDate = new Date('2026-12-31T23:59:59');
    
    const ordensToDeleteByDate = await prisma.ordemServico.findMany({
      where: {
        data: {
          gt: maxDate
        }
      },
      select: {
        id: true,
        numeroOS: true,
        data: true,
        nomeCliente: true,
        caminhoArquivo: true
      }
    });

    if (ordensToDeleteByDate.length > 0) {
      console.log(`⚠️  Encontrados ${ordensToDeleteByDate.length} registros com data futura:\n`);
      
      ordensToDeleteByDate.forEach((os, index) => {
        console.log(`${index + 1}. OS #${os.numeroOS} - ${os.data.toLocaleDateString('pt-BR')}`);
      });

      // Buscar atendimentos associados
      const atendimentosDate = await prisma.atendimento.findMany({
        where: {
          ordemServicoId: {
            in: ordensToDeleteByDate.map(os => os.id)
          }
        }
      });

      if (atendimentosDate.length > 0) {
        console.log(`📋 ${atendimentosDate.length} atendimentos associados também serão excluídos`);
      }

      // Executar deleção
      await prisma.$transaction(async (tx) => {
        if (atendimentosDate.length > 0) {
          await tx.atendimento.deleteMany({
            where: {
              ordemServicoId: {
                in: ordensToDeleteByDate.map(os => os.id)
              }
            }
          });
        }

        await tx.ordemServico.deleteMany({
          where: {
            data: {
              gt: maxDate
            }
          }
        });
      });

      console.log(`✅ ${ordensToDeleteByDate.length} registros com data futura excluídos\n`);
      totalDeleted += ordensToDeleteByDate.length;
    } else {
      console.log('✅ Nenhum registro com data > 2026 encontrado\n');
    }

    // ====== PARTE 2: Validar arquivos existentes ======
    console.log('📂 ETAPA 2: Validando arquivos PDF existentes...\n');

    const configManager = new ConfigManager();
    const config = configManager.getConfig();
    const pdfDirectory = config.pdfDirectory;

    console.log(`   Diretório de PDFs: ${pdfDirectory}\n`);

    // Buscar todos os registros do banco
    const allOrdens = await prisma.ordemServico.findMany({
      select: {
        id: true,
        numeroOS: true,
        caminhoArquivo: true,
        nomeArquivo: true,
        nomeCliente: true
      }
    });

    console.log(`   Total de registros no banco: ${allOrdens.length}`);
    console.log('   Verificando validade de cada arquivo...\n');

    const ordensToDeleteByValidation: number[] = [];
    let checkedCount = 0;
    let skippedCount = 0;

    for (const ordem of allOrdens) {
      checkedCount++;
      
      // Verificar se arquivo existe
      if (!fs.existsSync(ordem.caminhoArquivo)) {
        console.log(`   ⚠️  Arquivo não existe mais: ${ordem.nomeArquivo}`);
        ordensToDeleteByValidation.push(ordem.id);
        continue;
      }

      // Tentar validar o arquivo como OS
      try {
        await PDFParser.parsePDFFile(ordem.caminhoArquivo, ordem.nomeArquivo);
        // Se chegou aqui, o arquivo é válido
        if (checkedCount % 50 === 0) {
          console.log(`   ✓ Verificados: ${checkedCount}/${allOrdens.length}`);
        }
      } catch (error) {
        // Arquivo não passa mais na validação
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`   ❌ INVÁLIDO: ${ordem.nomeArquivo}`);
        console.log(`      OS #${ordem.numeroOS} - ${ordem.nomeCliente}`);
        console.log(`      Motivo: ${errorMsg.split('\n')[0]}`);
        ordensToDeleteByValidation.push(ordem.id);
      }
    }

    console.log(`\n   ✅ Verificação concluída: ${checkedCount} arquivos verificados`);

    if (ordensToDeleteByValidation.length > 0) {
      console.log(`\n⚠️  Encontrados ${ordensToDeleteByValidation.length} registros INVÁLIDOS para exclusão\n`);

      // Buscar atendimentos associados
      const atendimentosValidation = await prisma.atendimento.findMany({
        where: {
          ordemServicoId: {
            in: ordensToDeleteByValidation
          }
        }
      });

      if (atendimentosValidation.length > 0) {
        console.log(`📋 ${atendimentosValidation.length} atendimentos associados também serão excluídos\n`);
      }

      console.log('🗑️  Executando exclusões...\n');

      // Executar deleção
      await prisma.$transaction(async (tx) => {
        if (atendimentosValidation.length > 0) {
          const deletedAtendimentos = await tx.atendimento.deleteMany({
            where: {
              ordemServicoId: {
                in: ordensToDeleteByValidation
              }
            }
          });
          console.log(`✅ ${deletedAtendimentos.count} atendimentos excluídos`);
        }

        const deletedOrdens = await tx.ordemServico.deleteMany({
          where: {
            id: {
              in: ordensToDeleteByValidation
            }
          }
        });
        console.log(`✅ ${deletedOrdens.count} registros inválidos excluídos`);
        totalDeleted += deletedOrdens.count;
      });
    } else {
      console.log('✅ Todos os arquivos são válidos!\n');
    }

    // ====== RESUMO FINAL ======
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   🎉 Limpeza concluída com sucesso!`);
    console.log(`   📊 Total de registros excluídos: ${totalDeleted}`);
    console.log(`   ⚠️  IMPORTANTE: Nenhum arquivo físico foi modificado`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
cleanDatabase()
  .then(() => {
    console.log('\n🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script finalizado com erro:', error);
    process.exit(1);
  });
