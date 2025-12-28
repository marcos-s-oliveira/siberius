# Guia de Migração - Suporte a Estrutura Recursiva de Diretórios

## 📝 Alterações Realizadas

### 1. Schema do Banco de Dados (Prisma)
- **Adicionado campo**: `caminhoRelativo` na tabela `OrdemServico`
  - Armazena o caminho relativo do arquivo em relação ao diretório base
  - Útil para organização e busca por estrutura de pastas

### 2. Indexador de PDFs
- **Varredura recursiva**: O sistema agora escaneia todas as subpastas automaticamente
- **Tratamento de erros robusto**: Erros de acesso a pastas individuais não interrompem o processo
- **Performance melhorada**: Tempo de escaneamento é exibido nos logs

### 3. Configuração
- Atualizado `config.conf` com comentários explicando a varredura recursiva

## 🚀 Passos para Aplicar a Migração

### Passo 1: Regenerar o Prisma Client
```bash
npm run prisma:generate
```

### Passo 2: Criar e Aplicar a Migração
```bash
npm run prisma:migrate
```

Quando solicitado, dê um nome para a migração, por exemplo:
```
add_caminho_relativo_field
```

### Passo 3: (Opcional) Popular caminhos relativos para registros existentes

Se você já tem dados no banco, execute este script SQL para popular o campo `caminhoRelativo`:

```sql
-- Este é um exemplo - ajuste conforme seu diretório base
UPDATE ordens_servico 
SET caminho_relativo = REPLACE(caminho_arquivo, 'C:\ServiceOrder\', '');
```

Ou crie um script TypeScript para fazer isso de forma mais robusta.

### Passo 4: Reiniciar o Sistema
```bash
npm run dev
```

## ✅ Verificação

Após a migração, o sistema deve:
- ✅ Escanear recursivamente todas as subpastas
- ✅ Mostrar tempo de escaneamento nos logs
- ✅ Salvar caminho relativo para novos arquivos
- ✅ Continuar funcionando mesmo com erros de acesso a pastas específicas

## 📊 Estrutura de Diretórios Suportada

Agora funciona com estruturas como:

```
orcamentos/
└── empresa2025/
    └── clientes/
        ├── clienteA/
        │   ├── projeto1/
        │   │   └── 12345 - João - Manutenção - 25.12.2025.pdf
        │   └── projeto2/
        │       └── 12346 - João - Instalação - 26.12.2025.pdf
        └── clienteB/
            └── 12347 - Maria - Suporte - 27.12.2025.pdf
```

## 🔍 Consultas Úteis

### Ver todos os caminhos relativos
```sql
SELECT id, numero_os, caminho_relativo, nome_arquivo 
FROM ordens_servico 
ORDER BY caminho_relativo;
```

### Buscar por estrutura de pastas
```sql
SELECT * FROM ordens_servico 
WHERE caminho_relativo LIKE '%clienteA%';
```

## 🆘 Troubleshooting

### Erro: "Column 'caminho_relativo' does not exist"
**Solução**: Execute `npm run prisma:migrate` para aplicar a migração

### Arquivos não sendo encontrados
**Solução**: 
1. Verifique as permissões de leitura nas pastas
2. Confirme o caminho no `config.conf`
3. Ative `VERBOSE_LOGGING=true` para ver logs detalhados

### Performance lenta com muitas pastas
**Solução**: 
1. Aumente o `CHECK_INTERVAL_MINUTES` no `config.conf`
2. Considere indexar subpastas específicas em vez da raiz
