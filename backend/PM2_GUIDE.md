# 🚀 Guia de Deploy com PM2

## 📋 Pré-requisitos

```bash
npm install -g pm2
```

## 🔧 Configuração

O sistema tem **dois modos de execução** com PM2:

---

## ⚙️ Opção 1: Processos Contínuos (Recomendado)

**Arquivo:** `ecosystem.config.js`

- **API**: Roda continuamente
- **Indexador**: Roda em loop, verifica a cada 10 minutos

### Comandos:

```bash
# 1. Build do projeto
npm run build

# 2. Iniciar processos
pm2 start ecosystem.config.js

# 3. Verificar status
pm2 status
pm2 logs

# 4. Salvar para reiniciar automaticamente no boot
pm2 save
pm2 startup
```

**Intervalo de scan:** 10 minutos (configurável no `.env`)

---

## ⏰ Opção 2: API Contínua + Scan via Cron

**Arquivo:** `ecosystem.cron.js`

- **API**: Roda continuamente
- **Scan**: Executa a cada 10 minutos via cron do PM2

### Comandos:

```bash
# 1. Build do projeto
npm run build

# 2. Iniciar processos
pm2 start ecosystem.cron.js

# 3. Verificar status
pm2 status
pm2 logs siberius-scan --lines 50
```

**Intervalo de scan:** 10 minutos (configurável no cron: `*/10 * * * *`)

---

## 📊 Comparação

| Característica | Opção 1 (Contínuo) | Opção 2 (Cron) |
|----------------|-------------------|----------------|
| Uso de memória | Médio constante | Baixo (spikes) |
| Notificações real-time | ❌ Não (API separada) | ❌ Não (API separada) |
| Complexidade | Simples | Simples |
| Ideal para | Servidores dedicados | Ambientes limitados |

---

## 📝 Comandos Úteis

```bash
# Listar processos
pm2 list

# Ver logs
pm2 logs
pm2 logs siberius-api
pm2 logs siberius-indexer

# Reiniciar
pm2 restart siberius-api
pm2 restart siberius-indexer
pm2 restart all

# Parar
pm2 stop siberius-api
pm2 stop siberius-indexer
pm2 stop all

# Remover
pm2 delete siberius-api
pm2 delete siberius-indexer
pm2 delete all

# Monitoramento
pm2 monit

# Salvar configuração atual
pm2 save

# Auto-start no boot do sistema
pm2 startup
```

---

## ⚙️ Ajustar Intervalo de Scan

### Opção 1 (Contínuo):
Edite `.env`:
```env
CHECK_INTERVAL_MINUTES=5  # 5 minutos
CHECK_INTERVAL_MINUTES=15 # 15 minutos
CHECK_INTERVAL_MINUTES=30 # 30 minutos
```

### Opção 2 (Cron):
Edite `ecosystem.cron.js`:
```javascript
cron_restart: '*/5 * * * *',  // 5 minutos
cron_restart: '*/15 * * * *', // 15 minutos
cron_restart: '*/30 * * * *', // 30 minutos
cron_restart: '0 * * * *',    // 1 hora
```

---

## 🔍 Logs

Os logs ficam em `./logs/`:
```
logs/
├── api-error.log
├── api-out.log
├── indexer-error.log
├── indexer-out.log
├── scan-error.log
└── scan-out.log
```

Para rotacionar logs:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🚀 Deploy Rápido

```bash
# 1. Clonar/atualizar código
cd /caminho/backend

# 2. Instalar dependências
npm install

# 3. Compilar
npm run build

# 4. Configurar variáveis (editar .env)
nano .env

# 5. Iniciar com PM2
pm2 start ecosystem.config.js

# 6. Salvar e configurar auto-start
pm2 save
pm2 startup

# 7. Verificar
pm2 status
pm2 logs
```

---

## 🐳 Alternativa: Docker

Se preferir usar Docker em vez de PM2:
```bash
docker-compose up -d
```

Ver `docker-compose.yml` na raiz do projeto.
