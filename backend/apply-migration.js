const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔧 Aplicando colunas dataMontagem e horarioMontagem...');
    
    // Adiciona coluna dataFinalizacao em atendimentos
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "atendimentos" 
      ADD COLUMN IF NOT EXISTS "dataFinalizacao" TIMESTAMP(3);
    `);
    
    // Adiciona colunas de montagem em ordens_servico
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ordens_servico" 
      ADD COLUMN IF NOT EXISTS "dataMontagem" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "horarioMontagem" TEXT;
    `);
    
    console.log('✅ Colunas adicionadas com sucesso!');
    
    // Verifica se as colunas existem
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ordens_servico' 
      AND column_name IN ('dataMontagem', 'horarioMontagem');
    `);
    
    console.log('\n📋 Colunas encontradas:');
    console.log(result);
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
