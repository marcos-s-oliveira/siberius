# Guia de Migração - config.conf → .env

## ⚠️ IMPORTANTE: Mudança no Sistema de Configuração

A partir desta versão, **todas as configurações foram migradas para `.env`**.

O arquivo `config.conf` foi **descontinuado**.

## 🔄 Migração do config.conf para .env

### Passo 1: Criar arquivo .env

```bash
cd backend
cp .env.example .env
```

### Passo 2: Migrar configurações

**Antes (config.conf):**
```properties
PDF_DIRECTORY=C:\ServiceOrder
CHECK_INTERVAL_MINUTES=10
VERBOSE_LOGGING=true
```

**Depois (.env):**
```env
PDF_DIRECTORY="C:\ServiceOrder"
CHECK_INTERVAL_MINUTES=10
VERBOSE_LOGGING=true
```

### Passo 3: Adicionar configurações obrigatórias

O `.env` agora também precisa das configurações que antes estavam apenas no código:

```env
# Porta da API
API_PORT=3000

# Banco de dados
DATABASE_URL="postgresql://user:password@localhost:5432/siberius?schema=public"

# Segurança
JWT_SECRET="sua-chave-secreta-aqui"

# Indexador (suas configurações antigas do config.conf)
PDF_DIRECTORY="C:\ServiceOrder"
CHECK_INTERVAL_MINUTES=10
VERBOSE_LOGGING=true
```

### Passo 4: Deletar config.conf (opcional)

```bash
rm config.conf  # ou apenas renomear para backup
```

### Passo 5: Reiniciar aplicação

```bash
npm run dev
```

## ✅ Benefícios da Migração

1. **Centralização**: Todas as configurações em um único lugar
2. **Padrão da indústria**: `.env` é o padrão para Node.js
3. **Segurança**: `.env` está no `.gitignore` por padrão
4. **Deploy simplificado**: Fácil de configurar em diferentes ambientes
5. **Manutenção**: Menos arquivos de configuração para gerenciar

## 📝 Mapeamento Completo

| config.conf | .env | Observações |
|-------------|------|-------------|
| `PDF_DIRECTORY` | `PDF_DIRECTORY` | Use aspas se tiver espaços no caminho |
| `CHECK_INTERVAL_MINUTES` | `CHECK_INTERVAL_MINUTES` | Mesmo formato |
| `VERBOSE_LOGGING` | `VERBOSE_LOGGING` | `true` ou `false` (minúsculas) |
| N/A | `API_PORT` | Nova: porta do servidor (padrão: 3000) |
| N/A | `DATABASE_URL` | Nova: conexão PostgreSQL |
| N/A | `JWT_SECRET` | Nova: chave de segurança |

## 🔧 Troubleshooting

### Erro: "PDF_DIRECTORY não está configurado no arquivo .env"

**Solução**: Certifique-se de que o arquivo `.env` existe e contém:
```env
PDF_DIRECTORY="C:\ServiceOrder"
```

### Aplicação não lê o .env

**Solução**: 
1. Verifique se o arquivo se chama exatamente `.env` (não `.env.txt`)
2. Reinicie a aplicação
3. Verifique se o `dotenv` está instalado: `npm install dotenv`

### Caminhos com espaços no Windows

**Solução**: Use aspas:
```env
PDF_DIRECTORY="C:\Meus Documentos\ServiceOrder"
```

## 📚 Referências

- [Guia Completo de Implantação](../DEPLOYMENT_GUIDE.md)
- [Exemplo de .env](./.env.example)
