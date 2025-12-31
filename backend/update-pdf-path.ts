import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

async function updatePaths() {
  const baseDir = path.resolve(__dirname, 'test-pdfs');
  
  await prisma.ordemServico.update({
    where: { id: 1 },
    data: {
      caminhoArquivo: path.join(baseDir, '8020', '12432-test.pdf'),
      caminhoRelativo: path.join('test-pdfs', '8020', '12432-test.pdf')
    }
  });
  
  console.log('✓ Caminho atualizado para:', path.join(baseDir, '8020', '12432-test.pdf'));
  
  await prisma.$disconnect();
}

updatePaths();
