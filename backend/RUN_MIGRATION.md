# Migração para Detecção de Duplicatas

## Alterações Implementadas

### 1. PDFParser - Detecção de Orçamentos
- Adicionada função `isQuotationDocument()` que detecta orçamentos pelas palavras-chave:
  - "Nº Dias"
  - "Preço Unit."
  - "Valor"
- Orçamentos são **automaticamente descartados** durante a varredura

### 2. PDFIndexer - Detecção de Duplicatas
- Adicionado cálculo de hash MD5 do conteúdo do arquivo
- Arquivos com mesmo hash (mesmo conteúdo) são detectados e descartados
- Previne indexação de arquivos duplicados mesmo com nomes diferentes

### 3. Schema do Banco de Dados
- Adicionado campo `fileHash` na tabela `ordens_servico`
- Criado índice no campo `fileHash` para buscas rápidas

## Como Aplicar

Execute no terminal do backend:

```bash
# 1. Gerar a migration
npx prisma migrate dev --name add_file_hash

# 2. Aplicar a migration no banco
npx prisma migrate deploy

# 3. Regenerar o Prisma Client
npx prisma generate
```

## Teste da Funcionalidade

Para testar a detecção de orçamento vs ordem de serviço:

```bash
npx ts-node test-quotation-vs-os.ts
```

## Comportamento Esperado

✅ **Orçamentos**: Detectados e descartados (contêm "Nº Dias", "Preço Unit." e "Valor")

✅ **Duplicatas**: Arquivos com mesmo conteúdo são detectados pelo hash MD5 e descartados

✅ **Ordens de Serviço válidas**: Processadas normalmente
