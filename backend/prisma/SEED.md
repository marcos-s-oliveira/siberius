# Seed do Banco de Dados

## Descrição
Este arquivo seed popula o banco de dados com técnicos de exemplo para facilitar o desenvolvimento e testes.

## Técnicos Criados
O seed adiciona 10 técnicos com as seguintes especialidades:

1. **Carlos Silva** - Iluminação
2. **Ana Paula Santos** - Áudio
3. **Roberto Oliveira** - Vídeo
4. **Juliana Costa** - Estrutura
5. **Fernando Mendes** - Elétrica
6. **Patricia Lima** - Coordenação
7. **Marcos Pereira** - Iluminação
8. **Beatriz Almeida** - Áudio
9. **Lucas Ferreira** - Vídeo
10. **Camila Rodrigues** - Logística

## Como Executar

### Opção 1: Via npm script
```bash
npm run seed
```

### Opção 2: Via Prisma (após migrations)
```bash
npx prisma db seed
```

### Opção 3: Diretamente
```bash
npx tsx prisma/seed.ts
```

## Observações
- O seed **remove todos os técnicos existentes** antes de criar os novos
- Se desejar manter técnicos existentes, comente a linha `await prisma.tecnico.deleteMany({});` no arquivo `seed.ts`
- Todos os técnicos são criados com status `ativo: true`
- Os emails seguem o padrão: `nome.sobrenome@siberius.com`

## Especialidades Disponíveis
- Iluminação (2 técnicos)
- Áudio (2 técnicos)
- Vídeo (2 técnicos)
- Estrutura (1 técnico)
- Elétrica (1 técnico)
- Coordenação (1 técnico)
- Logística (1 técnico)
