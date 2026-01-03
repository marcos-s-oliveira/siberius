# 🔧 Scripts de Backend - Guia de Uso

O backend foi modularizado para permitir executar componentes separadamente.

## 📋 Modos de Execução

### 1. **Modo Completo** (API + Indexador contínuo)
Executa servidor API com indexação automática em segundo plano.

```bash
# Desenvolvimento (com hot-reload)
npm run dev:server

# Produção
npm run build
npm run start:server
```

**Use quando:** Ambiente de desenvolvimento ou produção com tudo integrado.

---

### 2. **Modo API Apenas** 
Executa apenas o servidor API REST + WebSocket, sem indexação.

```bash
# Desenvolvimento
npm run dev:api

# Produção
npm run build
npm run start:api
```

**Use quando:**
- Indexação roda em outra máquina/container
- Quer separar processos para melhor controle
- Ambiente de produção escalado

---

### 3. **Modo Indexador Apenas**
Executa apenas o indexador em modo contínuo (verifica periodicamente).

```bash
# Desenvolvimento
npm run dev:indexer

# Produção
npm run build
npm run start:indexer
```

**Use quando:**
- API roda separadamente
- Quer dedicar recursos apenas à indexação
- Ambiente com múltiplas instâncias

---

### 4. **Scan Único**
Executa um scan único e encerra (não fica em loop).

```bash
npm run scan
```

**Use quando:**
- Execução manual pontual
- Cron job agendado
- Teste rápido de indexação

**Exemplo de cron:**
```cron
# Executar scan a cada 30 minutos
*/30 * * * * cd /caminho/backend && npm run scan >> /var/log/scan.log 2>&1
```

---

## 🗂️ Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/server.ts` | API + Indexador (modo completo) |
| `src/api-only.ts` | Apenas API REST + WebSocket |
| `src/indexer-only.ts` | Apenas indexador contínuo |
| `src/scan-once.ts` | Scan único (executa e encerra) |

---

## 🏗️ Arquitetura Recomendada

### Ambiente de Desenvolvimento
```bash
# Terminal 1: API + Indexador tudo junto
npm run dev:server
```

### Ambiente de Produção (Separado)

**Servidor 1 (API):**
```bash
npm run start:api
```

**Servidor 2 (Indexador):**
```bash
# Opção A: Contínuo
npm run start:indexer

# Opção B: Via cron (mais eficiente)
# Adicionar ao crontab:
*/15 * * * * cd /app/backend && npm run scan
```

---

## 🔌 Diferenças entre Modos

| Modo | API REST | WebSocket | Indexador | Notificações |
|------|----------|-----------|-----------|--------------|
| `server` | ✅ | ✅ | ✅ Contínuo | ✅ Real-time |
| `api-only` | ✅ | ✅ | ❌ | ❌ |
| `indexer-only` | ❌ | ❌ | ✅ Contínuo | ❌ |
| `scan` | ❌ | ❌ | ✅ Único | ❌ |

---

## 🚀 Scripts Adicionais

### Limpeza do Banco
Remove registros com data > 2026:
```bash
npm run db:clean
```

### Prisma
```bash
npm run prisma:generate  # Gerar client
npm run prisma:migrate   # Rodar migrations
npm run prisma:studio    # Interface visual
npm run seed             # Popular banco
```

---

## ⚙️ Configuração

Todos os modos leem do arquivo `.env`:

```env
# Banco de dados
DATABASE_URL="postgresql://user:pass@localhost:5432/siberius"

# API
API_PORT=3000
FRONTEND_URL=http://localhost:5173

# Indexador
PDF_DIRECTORY=D:/PDFs
CHECK_INTERVAL_MINUTES=5
VERBOSE_LOGGING=true

# JWT
JWT_SECRET=sua-chave-secreta
```

---

## 💡 Dicas

1. **Desenvolvimento**: Use `dev:server` para ter tudo integrado
2. **Produção leve**: Use `api-only` + cron com `scan`
3. **Produção robusta**: Use `api-only` + `indexer-only` em processos separados
4. **Teste rápido**: Use `scan` para verificar se indexação funciona

---

## 🐳 Docker Compose Exemplo

```yaml
version: '3.8'

services:
  api:
    build: .
    command: npm run start:api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - API_PORT=3000
  
  indexer:
    build: .
    command: npm run start:indexer
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - PDF_DIRECTORY=/pdfs
    volumes:
      - /caminho/pdfs:/pdfs
```
