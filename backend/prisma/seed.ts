import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('��� Iniciando seed do banco de dados...');

  // Limpar técnicos existentes (opcional - comente se não quiser limpar)
  await prisma.tecnico.deleteMany({});
  console.log('✓ Técnicos existentes removidos');

  // Criar técnicos de exemplo
  const tecnicos = await Promise.all([
    prisma.tecnico.create({
      data: {
        nome: 'Carlos Silva',
        email: 'carlos.silva@siberius.com',
        telefone: '(11) 98765-4321',
        especialidade: 'Iluminação',
        ativo: true,
      },
    }),
    prisma.tecnico.create({
      data: {
        nome: 'Ana Paula Santos',
        email: 'ana.santos@siberius.com',
        telefone: '(11) 99876-5432',
        especialidade: 'Áudio',
        ativo: true,
      },
    }),
    prisma.tecnico.create({
      data: {
        nome: 'Roberto Oliveira',
        email: 'roberto.oliveira@siberius.com',
        telefone: '(11) 97654-3210',
        especialidade: 'Vídeo',
        ativo: true,
      },
    }),
    prisma.tecnico.create({
      data: {
        nome: 'Juliana Costa',
        email: 'juliana.costa@siberius.com',
        telefone: '(11) 96543-2109',
        especialidade: 'Estrutura',
        ativo: true,
      },
    }),
    prisma.tecnico.create({
      data: {
        nome: 'Fernando Mendes',
        email: 'fernando.mendes@siberius.com',
        telefone: '(11) 95432-1098',
        especialidade: 'Elétrica',
        ativo: true,
      },
    }),
    prisma.tecnico.create({
      data: {
        nome: 'Patricia Lima',
        email: 'patricia.lima@siberius.com',
        telefone: '(11) 94321-0987',
        especialidade: 'Coordenação',
        ativo: true,
      },
    }),
    prisma.tecnico.create({
      data: {
        nome: 'Marcos Pereira',
        email: 'marcos.pereira@siberius.com',
        telefone: '(11) 93210-9876',
        especialidade: 'Iluminação',
        ativo: true,
      },
    }),
    prisma.tecnico.create({
      data: {
        nome: 'Beatriz Almeida',
        email: 'beatriz.almeida@siberius.com',
        telefone: '(11) 92109-8765',
        especialidade: 'Áudio',
        ativo: true,
      },
    }),
    prisma.tecnico.create({
      data: {
        nome: 'Lucas Ferreira',
        email: 'lucas.ferreira@siberius.com',
        telefone: '(11) 91098-7654',
        especialidade: 'Vídeo',
        ativo: true,
      },
    }),
    prisma.tecnico.create({
      data: {
        nome: 'Camila Rodrigues',
        email: 'camila.rodrigues@siberius.com',
        telefone: '(11) 90987-6543',
        especialidade: 'Logística',
        ativo: true,
      },
    }),
  ]);

  console.log(`✓ ${tecnicos.length} técnicos criados com sucesso!`);
  console.log('\n��� Técnicos criados:');
  tecnicos.forEach((tec) => {
    console.log(`   - ${tec.nome} (${tec.especialidade}) - ${tec.email}`);
  });

  console.log('\n✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
