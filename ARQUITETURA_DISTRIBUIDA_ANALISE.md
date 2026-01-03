# Análise: Arquitetura Distribuída Siberius

## 📋 Visão Geral da Proposta

### Arquitetura Atual (Monolítica Local)
```
┌─────────────────────────────────────┐
│     Rede Local do Cliente           │
│                                      │
│  ┌──────────┐      ┌──────────┐    │
│  │ Frontend │◄────►│ Backend  │    │
│  │   Web    │      │   API    │    │
│  └──────────┘      └────┬─────┘    │
│                          │          │
│  ┌──────────┐      ┌────▼─────┐    │
│  │  Mobile  │      │ Indexador│    │
│  │   App    │      │   PDFs   │    │
│  └──────────┘      └────┬─────┘    │
│                          │          │
│                    ┌─────▼─────┐   │
│                    │ PostgreSQL│   │
│                    │   + PDFs  │   │
│                    └───────────┘   │
└─────────────────────────────────────┘
```

### Arquitetura Proposta (Híbrida Distribuída)
```
┌────────────────────────────────────────────────────────┐
│  VPS Cloud (https://sysfutura.prismasolutions.info)    │
│                                                         │
│  ┌─────────┐                                           │
│  │  Nginx  │ (HTTPS + SSL)                            │
│  │ Reverse │                                           │
│  │  Proxy  │                                           │
│  └────┬────┘                                           │
│       │                                                 │
│  ┌────▼──────────┐         ┌──────────────┐          │
│  │   Frontend    │         │   Backend    │          │
│  │     Web       │◄───────►│     API      │          │
│  │  (React/Vite) │         │  (Express)   │          │
│  └───────────────┘         └──────┬───────┘          │
│                                    │                   │
│                              ┌─────▼──────┐           │
│                              │ PostgreSQL │           │
│                              │ (Metadados)│           │
│                              └─────▲──────┘           │
│                                    │                   │
│                              ┌─────▼──────┐           │
│                              │  Storage   │           │
│                              │ PDFs Cache │           │
│                              │  (15 dias) │           │
│                              └────────────┘           │
└────────────────┬───────────────────────────────────────┘
                 │
                 │ WebSocket (Socket.IO)
                 │ Realtime Bidirectional
                 │
┌────────────────▼───────────────────────────────────────┐
│           Rede Local do Cliente                        │
│                                                         │
│  ┌──────────────────────────────────────┐             │
│  │   Daemon Local (Node.js Simples)    │             │
│  │  ✅ Varredura de PDFs                │             │
│  │  ✅ Parse de metadados               │             │
│  │  ✅ Envio via API REST/Socket        │             │
│  │  ✅ Upload sob demanda               │             │
│  │  ✅ Heartbeat/Reconexão              │             │
│  │  ❌ SEM banco de dados local        │             │
│  │  ❌ SEM armazenamento de estado     │             │
│  └─────────────────┬────────────────────┘             │
│                    │                                    │
│              ┌─────▼──────┐                            │
│              │    PDFs    │                            │
│              │   Local    │                            │
│              │  (Origem)  │                            │
│              └────────────┘                            │
│                                                         │
│  ┌──────────────────────────────────────┐             │
│  │      Mobile App                       │             │
│  │  - Conecta diretamente ao VPS        │             │
│  │  - Socket para notificações          │             │
│  │  - Download PDFs sob demanda         │             │
│  └───────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Objetivos e Benefícios

### ✅ Vantagens

1. **Acessibilidade Global**
   - Frontend e Backend acessíveis de qualquer lugar via HTTPS
   - App mobile funciona fora da rede local
   - Técnicos podem acessar de campo

2. **Segurança Aprimorada**
   - HTTPS com SSL/TLS
   - Nginx como proxy reverso
   - PDFs não expostos diretamente
   - Daemon local isolado

3. **Escalabilidade**
   - Backend pode escalar horizontalmente
   - Múltiplos clientes podem conectar ao mesmo VPS
   - Storage separado e gerenciável

4. **Economia de Recursos**
   - PDFs só sobem sob demanda
   - Cache com expiração automática (15 dias)
   - Reduz custos de storage

5. **Performance**
   - CDN pode ser adicionado facilmente
   - Frontend servido de forma otimizada
   - Metadados sempre disponíveis

6. **Resiliência**
   - Daemon local continua funcionando se cloud cair
   - PDFs locais preservados (fonte de verdade)
   - Sincronização automática quando reconectar

7. **Simplicidade do Daemon**
   - ✅ **SEM banco de dados local** - apenas lê PDFs do diretório
   - ✅ **SEM estado persistente** - servidor remoto é fonte de verdade
   - ✅ **Instalação trivial** - apenas Node.js necessário
   - ✅ **Manutenção zero** - sem backup, sem migrations
   - ✅ **Portátil** - roda em Windows/Linux/Mac sem modificações

### ⚠️ Desafios e Considerações

1. **Complexidade Aumentada**
   - Mais componentes para gerenciar
   - Deploy mais complexo
   - Debugging distribuído

2. **Latência de Rede**
   - Dependência de conexão internet
   - Possíveis delays em sincronização
   - PDFs podem demorar para upload

3. **Sincronização de Estado**
   - Garantir consistência entre local e remoto
   - Lidar com conflitos
   - Retry logic robusto

4. **Custos Adicionais**
   - VPS mensal
   - Domínio e SSL
   - Largura de banda

5. **Segurança do Daemon**
   - Autenticação daemon ↔ servidor
   - Tokens de acesso seguros
   - Proteção contra reconexões maliciosas

## 🔄 Fluxos de Dados Detalhados

### 1. Inicialização do Daemon Local

```
1. Daemon inicia (Node.js simples)
   ↓
2. Carrega configuração (arquivo .env ou config.json)
   - URL do servidor remoto: https://sysfutura.prismasolutions.info
   - Token de autenticação do daemon
   - Diretório de PDFs: C:\PDFs\Atendimentos
   - Client ID: identificador único da máquina
   ↓
3. Conecta ao servidor via WebSocket
   - wss://sysfutura.prismasolutions.info/socket.io/
   - Namespace: /daemon
   - Envia: { type: 'auth', token: 'xxx', clientId: 'yyy' }
   ↓
4. Servidor valida e responde
   - Verifica token no BD remoto
   - Registra cliente como 'online'
   - Retorna: { status: 'connected', clientId: 'yyy', lastSync: '2026-01-03T10:00:00Z' }
   ↓
5. Daemon inicia operações
   - Heartbeat a cada 30s (ping/pong)
   - File watcher no diretório de PDFs
   - Fila de upload em memória (não persiste)
   ↓
6. Se perder conexão
   - Mantém fila em memória (buffer limitado)
   - Tenta reconectar automaticamente
   - Ao reconectar, envia eventos pendentes
   
💡 **IMPORTANTE**: Todo estado está no servidor remoto!
   O daemon é stateless - apenas processa e envia.
```

### 2. Varredura e Indexação de PDFs

```
1. Daemon detecta novo PDF (ou interval scan)
   ↓
2. Parse local do PDF
   - Extrai metadados
   - Identifica tipo (Orçamento/OS/Montagem)
   - Valida estrutura
   ↓
3. Calcula hash do arquivo
   - SHA-256 do conteúdo
   - Verifica se já foi enviado
   ↓
4. Envia metadados via Socket para servidor remoto
   {
     type: 'pdf_indexed',
     clientId: 'client_abc123',
     data: {
       filename: 'orcamento_123.pdf',
       fileHash: 'abc123...',
       fileSize: 245678,
       filePath: 'C:\\PDFs\\Atendimentos\\orcamento_123.pdf', // Path local
       metadata: {
         tipo: 'orcamento',
         numero: '123',
         cliente: 'Cliente X',
         dataEvento: '2026-01-15',
         valorTotal: 12500.00,
         ...
       },
       indexedAt: '2026-01-03T10:30:00Z'
     }
   }
   ↓
5. Servidor remoto recebe e processa
   - ✅ Salva metadados no PostgreSQL (VPS)
   - ✅ Cria registro em 'pdf_cache' com status 'available_local'
   - ℹ️ **NÃO cria atendimento automaticamente**
   - ℹ️ Indexa apenas os metadados do PDF
   - ℹ️ Atendimento é criado APENAS quando:
     * Usuário "escala equipe" no calendário, OU
     * Admin cria atendimento manualmente no formulário
   - ✅ Calcula data de expiração: dataEvento + 15 dias
   - ❌ NÃO solicita upload ainda (sob demanda)
   - Retorna ACK: { received: true, recordId: 456, status: 'indexed' }
   ↓
6. Daemon recebe confirmação
   - ✅ Descarta dados (não armazena localmente)
   - ✅ Log de sucesso
   - ✅ Aguarda próxima ação
   - ❌ Não atualiza BD local (não existe!)
   
💡 **Chave**: Daemon não guarda estado, apenas processa e esquece.
   Se precisar reprocessar, pode ler o PDF novamente.
```

### 3. Solicitação de PDF sob Demanda

```
1. Usuário acessa funcionalidade que precisa do PDF
   - Abre calendário com lista de eventos
   - Clica em "Visualizar PDF"
   - App mobile solicita download
   ↓
2. Frontend verifica status do PDF
   GET /api/atendimentos/123/pdf/status
   Response: {
     status: 'available_local',  // ou 'cached', 'expired'
     fileHash: 'abc123...',
     cachedUntil: null
   }
   ↓
3. Se status = 'available_local', solicita upload
   POST /api/atendimentos/123/pdf/request
   ↓
4. Backend envia comando via Socket para Daemon
   {
     type: 'upload_pdf_request',
     requestId: 'req_789',
     data: {
       fileHash: 'abc123...',
       filename: 'orcamento_123.pdf',
       priority: 'high'  // ou 'normal'
     }
   }
   ↓
5. Daemon recebe e valida
   - Verifica se arquivo existe
   - Verifica hash corresponde
   - Inicia upload
   ↓
6. Upload via HTTP Multipart
   POST /api/daemon/upload
   Headers: {
     Authorization: Bearer daemon_token,
     X-Request-Id: req_789,
     X-File-Hash: abc123...
   }
   Body: multipart/form-data com o PDF
   ↓
7. Backend processa upload
   - Valida hash
   - Salva em storage (S3/local/volume)
   - Atualiza DB: status = 'cached'
   - Define expiração: dataEvento + 15 dias
   - Notifica frontend via Socket
   ↓
8. Frontend recebe notificação
   {
     type: 'pdf_ready',
     requestId: 'req_789',
     pdfUrl: '/api/atendimentos/123/pdf/download',
     expiresAt: '2026-01-30T00:00:00Z'
   }
   ↓
9. Frontend exibe PDF
   - Link de download disponível
   - Usuário pode visualizar/baixar
```

### 4. Limpeza Automática de Cache

```
1. Job agendado (cron) roda diariamente
   - 02:00 AM (horário de baixo uso)
   ↓
2. Query no banco de dados
   SELECT * FROM pdfs_cache
   WHERE status = 'cached'
   AND expiration_date < NOW()
   ↓
3. Para cada PDF expirado
   - Remove arquivo físico do storage
   - Atualiza DB: status = 'expired'
   - Log da limpeza
   ↓
4. Relatório de limpeza
   - X arquivos removidos
   - Y GB liberados
   - Envia notificação admin (opcional)
```

### 5. Reconexão e Resiliência

```
Cenário: Internet cai ou servidor reinicia

1. Daemon detecta desconexão
   - Timeout no ping/pong
   - Erro de socket
   ↓
2. Entra em modo de retry
   - Espera 5s
   - Tenta reconectar
   - Backoff exponencial: 5s, 10s, 20s, 40s, 60s (max)
   ↓
3. Durante desconexão
   - ✅ Continua varredura local (file watcher ativo)
   - ✅ Armazena eventos em fila **em memória** (limite: 100 itens)
   - ⚠️ Se crashar durante desconexão, perde fila (não persiste)
   - ℹ️ PDFs físicos estão seguros no diretório
   ↓
4. Quando reconecta
   - ✅ Autentica novamente com token
   - ✅ Envia eventos em fila (batch de 10 por vez)
   - ✅ Servidor responde com status de cada item
   - ✅ Se servidor diz "já tenho esse hash", daemon pula
   ↓
5. Servidor processa backlog
   - ✅ Deduplicação por hash (evita duplicatas)
   - ✅ Atualiza registros no PostgreSQL remoto
   - ✅ Retorna: { processed: 8, duplicates: 2, errors: 0 }
   ↓
6. Caso extremo: Daemon fica offline por muito tempo
   - Ao reconectar, pode fazer "full rescan"
   - Envia todos os hashes que tem localmente
   - Servidor diz quais precisa reprocessar
   - Daemon envia apenas os necessários
   
💡 **Filosofia**: PDFs locais são a fonte de verdade.
   Servidor é só um espelho dos metadados.
   Se algo der errado, basta reprocessar do diretório local.
```

## 🏗️ Componentes Técnicos Detalhados

### 1. Daemon Local (Node.js/TypeScript)

**Arquivo: `daemon/src/index.ts`**

```typescript
// Estrutura proposta (NÃO IMPLEMENTAR AINDA)
// Daemon SIMPLES e STATELESS

class SiberiusDaemon {
  private config: DaemonConfig;
  private socket: SocketIOClient;
  private pdfWatcher: FSWatcher;
  private uploadQueue: InMemoryQueue; // Em memória, não persiste
  private processedHashes: Set<string>; // Cache em memória, temporário
  
  async start() {
    console.log('🚀 Iniciando Siberius Daemon...');
    
    // 1. Carregar configuração (arquivo .env)
    this.config = await this.loadConfig();
    
    // 2. Conectar ao servidor remoto
    await this.connectToServer();
    
    // 3. Iniciar watcher de PDFs (chokidar)
    await this.startPDFWatcher();
    
    // 4. Iniciar heartbeat (ping a cada 30s)
    this.startHeartbeat();
    
    // 5. Scan inicial (processa PDFs existentes)
    await this.initialScan();
    
    console.log('✅ Daemon rodando!');
  }
  
  async connectToServer() {
    // Socket.IO client para servidor remoto
    // Autenticação com token
    // Handlers de eventos do servidor
  }
  
  async scanPDFDirectory() {
    // Lê diretório de PDFs
    // Para cada PDF: parse e envia ao servidor
    // Servidor que decide o que fazer com os dados
  }
  
  async processPDF(filePath: string) {
    // 1. Calcula hash
    // 2. Verifica se já processou recentemente (cache em memória)
    // 3. Parse metadados (usando PDFParser existente)
    // 4. Envia via Socket para servidor
    // 5. Aguarda ACK
    // 6. Descarta dados (não salva localmente)
  }
  
  async uploadPDF(request: UploadRequest) {
    // Upload via HTTP multipart
    // Stream do arquivo para economizar memória
    // Progress tracking (emite eventos)
    // Retry automático em caso de falha
  }
  
  handleDisconnect() {
    // Retry com backoff exponencial
    // Mantém fila em memória (limitada a 100 itens)
    // Ao reconectar, envia pendências
  }
}

// 💡 Vantagens do Daemon Stateless:
// - Instalação: apenas 'npm install' e configurar .env
// - Zero manutenção de banco
// - Leve: ~50MB RAM
// - Portátil: roda em qualquer OS
// - Se crashar, basta reiniciar
```
```

**Dependências (minimalistas):**
- `socket.io-client`: WebSocket client (~2MB)
- `chokidar`: File system watcher (~500KB)
- `axios`: HTTP para uploads (~200KB)
- `pdfjs-dist`: Parse PDFs (reutiliza código existente)
- `dotenv`: Configuração via .env
- `winston`: Logs estruturados (opcional)

**❌ NÃO precisa:**
- ❌ PostgreSQL, MySQL, SQLite, ou qualquer BD
- ❌ Prisma, TypeORM, Sequelize
- ❌ Redis ou cache externo
- ❌ Migrations ou seeds
- ❌ Backup local

**📦 Instalação total: ~30MB** (Node.js + dependências)
**💾 Uso de RAM: ~50-100MB** em operação normal
**🚀 Tempo de deploy: ~5 minutos** (copiar, npm install, configurar)

**Configuração via arquivo `.env`:**
```env
# .env do daemon
SERVER_URL=https://sysfutura.prismasolutions.info
DAEMON_TOKEN=seu_token_aqui
PDF_DIRECTORY=C:\PDFs\Atendimentos
CLIENT_ID=cliente_empresa_x
CHECK_INTERVAL_MINUTES=5
```

**Isso é tudo que precisa! 🎉**

### 2. Backend Modificado (Express + Socket.IO)

**Novos Endpoints:**

```typescript
// API para Daemon
POST   /api/daemon/auth          // Autenticar daemon
POST   /api/daemon/heartbeat     // Heartbeat com informações atualizadas
POST   /api/daemon/upload        // Upload de PDF
GET    /api/daemon/status        // Status do daemon

// API para Frontend
GET    /api/pdfs/:id/status      // Status do PDF
POST   /api/pdfs/:id/request     // Solicitar PDF
GET    /api/pdfs/:id/download    // Download PDF

// API Admin - Monitoramento
GET    /api/admin/daemons        // Lista todos os daemons
GET    /api/admin/daemons/:id    // Detalhes de um daemon específico

// Health Check Expandido
GET    /health                   // Health básico
GET    /health/detailed          // Health detalhado (requer auth)

// Socket.IO Namespaces
/daemon  → Comunicação com daemons
/client  → Comunicação com frontends/mobile
```

**Eventos Socket.IO:**

```typescript
// Daemon → Server
'daemon:auth'
'daemon:heartbeat'
'daemon:pdf_indexed'
'daemon:upload_complete'
'daemon:error'

// Server → Daemon
'daemon:upload_request'
'daemon:cancel_upload'
'daemon:config_update'

// Server → Client
'pdf:ready'
'pdf:upload_progress'
'pdf:expired'
'atendimento:updated'
```

**Endpoint /health Detalhado:**

```typescript
// GET /health - Público (ALB/Load Balancer)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GET /health/detailed - Requer autenticação
app.get('/health/detailed', authMiddleware, async (req, res) => {
  const daemons = await prisma.daemon_clients.findMany({
    select: {
      client_id: true,
      client_name: true,
      status: true,
      last_seen: true,
      last_heartbeat: true,
      connected_at: true,
      remote_addr: true,
      local_addr: true,
      daemon_version: true,
      platform: true,
      hostname: true,
      pdfs_indexed: true,
      pdfs_uploaded: true,
      uptime_seconds: true
    }
  });

  const stats = {
    server: {
      status: 'healthy',
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    },
    database: {
      connected: await checkDatabaseConnection(),
      pdfs_cached: await prisma.pdf_cache.count({ where: { status: 'cached' }}),
      pdfs_total: await prisma.pdf_cache.count()
    },
    daemons: {
      total: daemons.length,
      online: daemons.filter(d => d.status === 'online').length,
      offline: daemons.filter(d => d.status === 'offline').length,
      list: daemons.map(d => ({
        ...d,
        uptimeFormatted: formatUptime(d.uptime_seconds),
        lastSeenAgo: formatTimeAgo(d.last_seen)
      }))
    }
  };

  res.json(stats);
});
```

**Heartbeat Expandido do Daemon:**

```typescript
// Daemon envia heartbeat a cada 30s
setInterval(async () => {
  const systemInfo = {
    client_id: config.clientId,
    remote_addr: await getPublicIP(), // Via api.ipify.org
    local_addr: getLocalIP(),          // Interface de rede local
    daemon_version: packageJson.version,
    node_version: process.version,
    platform: process.platform,
    hostname: os.hostname(),
    uptime_seconds: Math.floor(process.uptime()),
    memory_usage: process.memoryUsage().heapUsed,
    pdfs_indexed_session: indexedCount // Contador da sessão
  };

  socket.emit('daemon:heartbeat', systemInfo);
}, 30000);
```

### 3. Storage de PDFs

**Opções:**

**Opção A: Storage Local no VPS**
```
/var/siberius/
  ├── pdfs/
  │   ├── 2026/
  │   │   ├── 01/
  │   │   │   ├── abc123_orcamento_123.pdf
  │   │   │   └── def456_os_456.pdf
```
- ✅ Simples
- ✅ Sem dependências externas
- ⚠️ Limitado ao disco do VPS
- ⚠️ Backup manual necessário

**Opção B: AWS S3 / MinIO**
```typescript
// Exemplo MinIO (S3-compatible, self-hosted)
const minioClient = new Minio.Client({
  endPoint: 'storage.sysfutura.prismasolutions.info',
  port: 9000,
  useSSL: true,
  accessKey: 'xxx',
  secretKey: 'yyy'
});
```
- ✅ Escalável
- ✅ Backup automático
- ✅ CDN-friendly
- ⚠️ Custo adicional
- ⚠️ Complexidade

**Recomendação Inicial:** Opção A (local), migrar para B se necessário

### 4. Banco de Dados - Schema Adicional

```sql
-- Tabela para rastrear PDFs e cache
CREATE TABLE pdf_cache (
  id SERIAL PRIMARY KEY,
  atendimento_id INT REFERENCES atendimentos(id),
  file_hash VARCHAR(64) UNIQUE NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path VARCHAR(512), -- Path no storage
  
  status VARCHAR(20) NOT NULL, 
  -- 'available_local': Daemon tem localmente
  -- 'uploading': Upload em progresso
  -- 'cached': Disponível no servidor
  -- 'expired': Cache expirado, precisa re-upload
  
  cached_at TIMESTAMP,
  expires_at TIMESTAMP, -- dataEvento + 15 dias
  last_accessed TIMESTAMP,
  
  client_id VARCHAR(100), -- ID do daemon/cliente
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para rastrear daemons conectados
CREATE TABLE daemon_clients (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(100) UNIQUE NOT NULL,
  client_name VARCHAR(255),
  token_hash VARCHAR(64) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'offline',
  -- 'online', 'offline', 'reconnecting'
  
  -- Informações de conexão e rede
  last_seen TIMESTAMP,
  last_heartbeat TIMESTAMP,
  connected_at TIMESTAMP,
  disconnected_at TIMESTAMP,
  
  remote_addr VARCHAR(45), -- IP público/externo (IPv4 ou IPv6)
  local_addr VARCHAR(45),  -- IP da rede local
  
  -- Informações do daemon
  daemon_version VARCHAR(20),
  node_version VARCHAR(20),
  platform VARCHAR(20), -- 'win32', 'linux', 'darwin'
  hostname VARCHAR(255),
  
  -- Estatísticas
  pdfs_indexed INT DEFAULT 0,
  pdfs_uploaded INT DEFAULT 0,
  last_pdf_indexed TIMESTAMP,
  uptime_seconds BIGINT DEFAULT 0,
  
  config JSONB, -- Configurações específicas
  metadata JSONB, -- Outros dados
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para rastrear uploads e downloads
CREATE TABLE pdf_transfers (
  id SERIAL PRIMARY KEY,
  pdf_cache_id INT REFERENCES pdf_cache(id),
  transfer_type VARCHAR(20) NOT NULL, -- 'upload', 'download'
  
  requested_by INT REFERENCES usuarios(id),
  requested_at TIMESTAMP DEFAULT NOW(),
  
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  status VARCHAR(20), -- 'pending', 'in_progress', 'completed', 'failed'
  progress INT DEFAULT 0, -- 0-100
  
  bytes_transferred BIGINT,
  error_message TEXT,
  
  client_id VARCHAR(100) REFERENCES daemon_clients(client_id)
);

-- Índices
CREATE INDEX idx_pdf_cache_status ON pdf_cache(status);
CREATE INDEX idx_pdf_cache_expires ON pdf_cache(expires_at);
CREATE INDEX idx_pdf_cache_hash ON pdf_cache(file_hash);
CREATE INDEX idx_daemon_clients_status ON daemon_clients(status);
CREATE INDEX idx_pdf_transfers_status ON pdf_transfers(status);
```

### 5. Nginx Configuração

```nginx
# /etc/nginx/sites-available/sysfutura

upstream backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name sysfutura.prismasolutions.info;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sysfutura.prismasolutions.info;
    
    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/sysfutura.prismasolutions.info/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sysfutura.prismasolutions.info/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Frontend (SPA)
    location / {
        root /var/www/siberius/frontend;
        try_files $uri $uri/ /index.html;
        
        # Cache para assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout para uploads grandes
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # Limites de upload
        client_max_body_size 50M;
    }
    
    # WebSocket (Socket.IO)
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Timeouts longos para WebSocket
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
    
    # Health check
    location /health {
        proxy_pass http://backend;
        access_log off;
    }
}
```

## 🔒 Segurança

### 1. Autenticação do Daemon

**Token-based Authentication:**

```typescript
// Gerar token único por daemon
const daemonToken = crypto.randomBytes(32).toString('hex');

// Hash para armazenar no DB
const tokenHash = crypto
  .createHash('sha256')
  .update(daemonToken)
  .digest('hex');

// Daemon envia token em cada conexão
socket.emit('daemon:auth', { 
  token: daemonToken,
  clientId: 'unique-machine-id',
  version: '1.0.0'
});
```

**Validação no servidor:**
```typescript
socket.on('daemon:auth', async (data) => {
  const tokenHash = hashToken(data.token);
  const client = await findDaemonByToken(tokenHash);
  
  if (!client || client.status === 'blocked') {
    socket.disconnect();
    return;
  }
  
  // Atualizar status
  await updateDaemonStatus(client.id, 'online');
  
  // Associar socket ao cliente
  socket.clientId = client.client_id;
});
```

### 2. Proteção de PDFs

```typescript
// Endpoint de download com autenticação
router.get('/api/pdfs/:id/download', 
  authMiddleware,  // Requer usuário autenticado
  async (req, res) => {
    const pdf = await getPDFById(req.params.id);
    
    // Verificar permissões
    if (!userCanAccessPDF(req.user, pdf)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    // Verificar se está em cache
    if (pdf.status !== 'cached') {
      return res.status(404).json({ 
        error: 'PDF não disponível',
        status: pdf.status
      });
    }
    
    // Stream do arquivo
    const fileStream = getFileStream(pdf.file_path);
    fileStream.pipe(res);
  }
);
```

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Limitar requisições de upload
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 uploads por daemon
  keyGenerator: (req) => req.daemonId,
  message: 'Muitos uploads, tente novamente mais tarde'
});

router.post('/api/daemon/upload', 
  daemonAuthMiddleware,
  uploadLimiter,
  handleUpload
);
```

### 4. Validação de PDFs

```typescript
// Antes de aceitar upload
async function validatePDFUpload(file, metadata) {
  // 1. Verificar extensão
  if (!file.originalname.endsWith('.pdf')) {
    throw new Error('Apenas arquivos PDF são permitidos');
  }
  
  // 2. Verificar tamanho (max 50MB)
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('Arquivo muito grande (max 50MB)');
  }
  
  // 3. Verificar hash corresponde
  const fileHash = calculateHash(file.buffer);
  if (fileHash !== metadata.fileHash) {
    throw new Error('Hash do arquivo não corresponde');
  }
  
  // 4. Verificar se é PDF válido
  const isValid = await isPDFValid(file.buffer);
  if (!isValid) {
    throw new Error('Arquivo PDF corrompido ou inválido');
  }
  
  return true;
}
```

## 📊 Monitoramento e Logs

### 1. Métricas a Rastrear

```typescript
interface DaemonMetrics {
  // Conectividade
  uptime: number;
  lastSeen: Date;
  reconnections: number;
  
  // PDFs
  pdfsIndexed: number;
  pdfsUploaded: number;
  uploadsFailed: number;
  
  // Performance
  avgUploadSpeed: number; // MB/s
  avgParseTime: number;   // ms
  
  // Erros
  errors: ErrorLog[];
}

interface ServerMetrics {
  // Daemons
  daemonsOnline: number;
  daemonsTotal: number;
  
  // Cache
  pdfsCached: number;
  cacheSize: number; // GB
  cacheHitRate: number; // %
  
  // Transferências
  uploadsInProgress: number;
  downloadsInProgress: number;
  
  // Performance
  avgResponseTime: number;
  requestsPerMinute: number;
}
```

### 2. Dashboard Admin - Monitoramento de Daemons

**Nova tela no Admin Panel: "Monitoramento de Sistema"**

**Rota:** `/admin/system-monitor`

**Componente:** `SystemMonitor.tsx`

**Funcionalidades:**

#### Visão Geral (Cards no Topo)
```tsx
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  Daemons Ativos │  PDFs Indexados │  Cache Utilizado│  Uptime Servidor│
│       3 🟢      │     1,234       │    45.2 GB      │    15 dias      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

#### Tabela de Daemons Conectados
```tsx
┌───────────────┬──────────┬────────────────┬──────────────┬──────────────┬─────────┐
│ Nome          │ Status   │ IP Remoto      │ IP Local     │ Última Visão │ Ações   │
├───────────────┼──────────┼────────────────┼──────────────┼──────────────┼─────────┤
│ Matriz SP     │ 🟢 Online│ 200.150.10.5   │ 192.168.1.10 │ 5s atrás     │ [Ver]   │
│ Filial RJ     │ 🟢 Online│ 179.200.50.20  │ 10.0.0.50    │ 12s atrás    │ [Ver]   │
│ Escritório BH │ 🔴 Offline│ 189.10.20.30  │ 192.168.0.20 │ 2h atrás     │ [Ver]   │
└───────────────┴──────────┴────────────────┴──────────────┴──────────────┴─────────┘
```

#### Detalhes do Daemon (Modal ao clicar "Ver")
```tsx
╔════════════════════ Daemon: Matriz SP ════════════════════╗
║                                                            ║
║  📊 Informações Gerais                                    ║
║  ├─ Client ID: client_matriz_sp_001                       ║
║  ├─ Hostname: DESKTOP-MATRIZ                              ║
║  ├─ Plataforma: Windows 11 (win32)                        ║
║  ├─ Versão Daemon: 1.2.3                                  ║
║  └─ Node.js: v20.10.0                                     ║
║                                                            ║
║  🌐 Rede                                                   ║
║  ├─ IP Público: 200.150.10.5                              ║
║  ├─ IP Local: 192.168.1.10                                ║
║  ├─ Última Conexão: 2026-01-03 10:30:00                   ║
║  └─ Última Heartbeat: 5 segundos atrás                    ║
║                                                            ║
║  📈 Estatísticas                                           ║
║  ├─ PDFs Indexados (Total): 1,234                         ║
║  ├─ PDFs Enviados: 456                                    ║
║  ├─ Último PDF: 3 minutos atrás                           ║
║  ├─ Uptime: 5 dias, 3 horas, 25 minutos                   ║
║  └─ Uso de Memória: 87 MB                                 ║
║                                                            ║
║  📂 Configuração                                           ║
║  ├─ Diretório PDFs: C:\PDFs\Atendimentos                  ║
║  ├─ Intervalo Scan: 5 minutos                             ║
║  └─ Auto Upload: Desabilitado                             ║
║                                                            ║
║  [Forçar Resync] [Desconectar] [Ver Logs] [Fechar]       ║
╚════════════════════════════════════════════════════════════╝
```

#### Gráficos e Métricas
- **Timeline de Conexões**: Gráfico mostrando quando cada daemon conectou/desconectou
- **PDFs Indexados por Hora**: Gráfico de linha mostrando atividade
- **Uso de Storage**: Gráfico de pizza do cache de PDFs
- **Latência de Heartbeat**: Tempo de resposta de cada daemon

#### Alertas e Notificações
```tsx
⚠️ Daemon "Escritório BH" offline há 2 horas
⚠️ Cache de PDFs atingindo 80% da capacidade
✅ Todos os daemons atualizados para versão 1.2.3
```

#### API Endpoints Usados pela Tela
```typescript
// Frontend faz polling a cada 10s
const { data } = await api.get('/api/admin/daemons');

// Dados em tempo real via Socket.IO
socket.on('daemon:status_changed', (data) => {
  updateDaemonStatus(data);
});

socket.on('daemon:heartbeat', (data) => {
  updateDaemonHeartbeat(data);
});
```

### 3. Logs Estruturados

```typescript
// Winston logger com níveis
logger.info('daemon:connected', {
  clientId: 'client_123',
  version: '1.0.0',
  ip: '192.168.1.100'
});

logger.warn('pdf:upload:slow', {
  fileHash: 'abc123',
  uploadTime: 45000, // ms
  fileSize: 12000000 // bytes
});

logger.error('daemon:auth:failed', {
  clientId: 'unknown',
  reason: 'invalid_token',
  ip: '1.2.3.4'
});
```

## 🎯 Vantagens Práticas da Arquitetura Stateless

### Comparação: Com BD Local vs Sem BD Local

| Aspecto | Com BD Local | Sem BD Local (✅ Nossa escolha) |
|---------|--------------|----------------------------------|
| **Instalação** | PostgreSQL + Node.js + Migrations | Apenas Node.js |
| **Tempo Setup** | ~30 min | ~5 min |
| **Requisitos** | 2GB RAM + 10GB disco | 100MB RAM + 50MB disco |
| **Manutenção** | Backup, migrations, limpeza | Zero manutenção |
| **Complexidade** | Alta | Baixa |
| **Portabilidade** | Difícil (dump/restore) | Trivial (copiar pasta) |
| **Debugging** | Logs + BD + sync issues | Apenas logs |
| **Custo** | Dev time alto | Dev time mínimo |
| **Falhas** | BD corrupto, sync conflict | Apenas network (temporário) |
| **Rollback** | Restore backup | Deletar pasta e reinstalar |

### Instalação do Daemon (Ultra-simples)

```bash
# 1. Instalar Node.js (se não tiver)
choco install nodejs  # Windows
# ou
apt install nodejs     # Linux

# 2. Copiar daemon
cd C:\Siberius\Daemon
git clone https://github.com/seu-repo/siberius-daemon.git
cd siberius-daemon

# 3. Instalar dependências
npm install  # ~30 segundos

# 4. Configurar
cp .env.example .env
notepad .env  # Editar: URL servidor, token, diretório PDFs

# 5. Rodar
npm start

# Pronto! 🎉
```

**Windows Service (opcional):**
```bash
# Instalar como serviço do Windows
npm install -g node-windows
node install-service.js
# Agora inicia automaticamente com o Windows
```

**Linux/Mac (systemd):**
```bash
# Copiar arquivo de serviço
sudo cp siberius-daemon.service /etc/systemd/system/
sudo systemctl enable siberius-daemon
sudo systemctl start siberius-daemon
```

### Atualização do Daemon

```bash
# Versão nova disponível?
cd C:\Siberius\Daemon
git pull
npm install  # Atualiza dependências se necessário
npm restart

# Sem migrations, sem backup, sem complicação!
```

## 🚀 Estratégia de Implementação

### Fase 1: Fundação (Semana 1-2)

1. **Setup VPS**
   - [ ] Provisionar VPS
   - [ ] Instalar Node.js, PostgreSQL, Nginx
   - [ ] Configurar firewall
   - [ ] Setup SSL com Let's Encrypt
   - [ ] Configurar domínio DNS

2. **Preparar Backend**
   - [ ] Adicionar Socket.IO ao backend
   - [ ] Criar endpoints para daemon
   - [ ] Criar schema de banco (pdf_cache, daemon_clients)
   - [ ] Implementar autenticação de daemon
   - [ ] Setup de storage local

3. **Criar Daemon Básico**
   - [ ] Estrutura do projeto
   - [ ] Conexão Socket.IO
   - [ ] Autenticação com servidor
   - [ ] Heartbeat básico

### Fase 2: Sincronização de Metadados (Semana 3-4)

4. **Indexação Local**
   - [ ] File watcher (chokidar)
   - [ ] Reutilizar PDFParser existente
   - [ ] Envio de metadados via Socket
   - [ ] Deduplicação por hash

5. **Recepção no Servidor**
   - [ ] Handler de eventos de indexação
   - [ ] Salvar metadados no DB
   - [ ] Associar com atendimentos existentes
   - [ ] Notificar frontend de novos PDFs

### Fase 3: Upload sob Demanda (Semana 5-6)

6. **Request de PDFs**
   - [ ] Frontend: botão "Visualizar PDF"
   - [ ] Verificar status do PDF
   - [ ] Solicitar upload se necessário
   - [ ] UI de progresso

7. **Upload de PDFs**
   - [ ] Daemon: handler de upload request
   - [ ] Upload via HTTP multipart
   - [ ] Progress tracking
   - [ ] Retry logic
   - [ ] Notificação de conclusão

8. **Download de PDFs**
   - [ ] Endpoint de download protegido
   - [ ] Streaming de arquivos
   - [ ] Controle de acesso
   - [ ] Analytics de uso

### Fase 4: Cache e Limpeza (Semana 7)

9. **Sistema de Expiração**
   - [ ] Calcular data de expiração (dataEvento + 15 dias)
   - [ ] Job cron de limpeza
   - [ ] Remoção de arquivos expirados
   - [ ] Logs e relatórios

10. **Otimizações**
    - [ ] Compressão de PDFs (opcional)
    - [ ] Thumbnails/previews
    - [ ] CDN para assets
    - [ ] Cache HTTP

### Fase 5: Resiliência e Deploy (Semana 8)

11. **Robustez**
    - [ ] Reconexão automática
    - [ ] Fila de eventos offline
    - [ ] Tratamento de erros
    - [ ] Timeouts e retries

12. **Deploy e Testes**
    - [ ] Deploy backend no VPS
    - [ ] Deploy frontend (build Vite)
    - [ ] Configurar Nginx
    - [ ] Instalar daemon localmente
    - [ ] Testes end-to-end

### Fase 6: Monitoramento e Docs (Semana 9)

13. **Observabilidade**
    - [ ] Dashboard de admin
    - [ ] Métricas e logs
    - [ ] Alertas
    - [ ] Health checks

14. **Documentação**
    - [ ] Guia de instalação do daemon
    - [ ] Documentação da API
    - [ ] Troubleshooting
    - [ ] Runbooks de operação

## 💰 Estimativa de Custos

### VPS (Mensal)

**Opção 1: DigitalOcean / Vultr / Linode**
- 2 vCPU, 4GB RAM, 80GB SSD: ~$24/mês
- Backup automático: +$5/mês
- **Total: ~$30/mês**

**Opção 2: Contabo**
- 4 vCPU, 8GB RAM, 200GB SSD: ~€7/mês (~$8)
- **Total: ~$10/mês**

**Opção 3: Oracle Cloud (Free Tier)**
- 4 ARM vCPU, 24GB RAM, 200GB: **GRÁTIS**
- Limitações: ARM architecture, menos suporte
- **Total: $0/mês**

### Domínio e SSL

- Domínio: ~$15/ano
- SSL (Let's Encrypt): **GRÁTIS**

### Storage Adicional (se necessário)

- Block Storage (100GB): +$10/mês
- S3-compatible (MinIO self-hosted): incluído no VPS

### Total Estimado

- **Mínimo**: $0-10/mês (Oracle Free Tier / Contabo)
- **Recomendado**: $30-50/mês (VPS confiável + backup)

## ⚠️ Riscos e Mitigações

### Risco 1: Perda de Conexão Prolongada
**Impacto:** Daemon offline, novos PDFs não sincronizados
**Mitigação:**
- Fila local de eventos
- Sincronização em batch ao reconectar
- Alertas de desconexão

### Risco 2: Falha no Upload
**Impacto:** PDF não disponível quando solicitado
**Mitigação:**
- Retry automático (3 tentativas)
- Fallback: solicitar manualmente
- Notificar usuário do status

### Risco 3: Storage Cheio no VPS
**Impacto:** Não consegue aceitar novos PDFs
**Mitigação:**
- Monitoramento de espaço em disco
- Limpeza agressiva de expirados
- Alerta aos 80% de uso
- Compactação de PDFs

### Risco 4: Sobrecarga do Servidor
**Impacto:** Lentidão, timeouts
**Mitigação:**
- Rate limiting por daemon
- Fila de uploads (max 3 simultâneos)
- Escalar VPS se necessário
- Load balancer (futuro)

### Risco 5: Segurança - Token Vazado
**Impacto:** Acesso não autorizado
**Mitigação:**
- Tokens rotativos (refresh)
- IP whitelisting (opcional)
- Logs de autenticação
- Revogar tokens comprometidos

### Risco 6: Sincronização Inconsistente
**Impacto:** Dados locais ≠ dados remotos
**Mitigação:**
- Hash para deduplicação
- Timestamp de última atualização
- Endpoint de "force sync"
- Reconciliation job

## 🔄 Migração do Sistema Atual

### Estratégia: Blue-Green Deployment

1. **Manter sistema atual funcionando** (Blue)
2. **Deploy novo sistema em paralelo** (Green)
3. **Testar com subset de dados**
4. **Migração gradual**
5. **Cutover quando estável**

### Passos de Migração

#### 1. Preparação (Não quebra nada)
```bash
# No servidor atual
# Adicionar suporte a Socket.IO (mantém REST funcionando)
npm install socket.io

# Backend aceita tanto REST quanto Socket
# Frontend continua usando REST
```

#### 2. Deploy VPS (Paralelo)
```bash
# VPS novo
# Deploy backend + frontend
# Apontar para DB de staging (cópia)

# Testar sem afetar produção
```

#### 3. Instalação Daemon (Opcional no início)
```bash
# Máquina local (opcional)
# Daemon convive com indexador atual
# Daemon envia para VPS, indexador para local

# Se algo falhar, indexador continua funcionando
```

#### 4. Cutover (Quando pronto)
```bash
# 1. Desabilitar indexador local
# 2. Habilitar daemon
# 3. Frontend aponta para VPS
# 4. Migrar dados (se necessário)
```

### Rollback Plan

Se algo der errado:
```bash
# 1. Parar daemon
# 2. Reiniciar indexador local
# 3. Frontend volta a apontar para servidor local
# 4. Investigar problema no VPS
```

## 📋 Checklist de Decisões Necessárias

Antes de implementar, decidir:

### Infraestrutura
- [ ] Qual provedor de VPS? (DigitalOcean / Contabo / Oracle)
- [ ] Qual região do datacenter? (mais próximo dos usuários)
- [ ] Usar storage local ou S3/MinIO?
- [ ] Backup strategy? (rsync / snapshots / S3)

### Arquitetura
- [ ] Daemon em Node.js ou outra linguagem?
- [ ] PostgreSQL no VPS ou DB gerenciado?
- [ ] Usar Redis para cache? (opcional)
- [ ] CDN para frontend? (Cloudflare?)

### Funcionalidades
- [ ] Compressão de PDFs antes de upload?
- [ ] Gerar thumbnails dos PDFs?
- [ ] Permitir múltiplos daemons por cliente?
- [ ] Interface web para gerenciar daemon?

### Segurança
- [ ] Autenticação 2FA para admin?
- [ ] VPN para acesso daemon → servidor?
- [ ] IP whitelist ou aberto com autenticação?
- [ ] Encriptar PDFs em repouso?

### Monitoramento
- [ ] Usar Grafana/Prometheus?
- [ ] Logs centralizados (ELK stack)?
- [ ] Alertas por email/Slack/SMS?

## 📝 Próximos Passos Sugeridos

### Curto Prazo (Esta Semana)
1. **Escolher provedor VPS** - Criar conta e testar
2. **Registrar domínio** (se ainda não tiver)
3. **Prototipar daemon básico** - Apenas conexão Socket.IO
4. **Desenhar schema de DB** - Revisar tabelas propostas

### Médio Prazo (Próximas 2 Semanas)
5. **Setup ambiente de staging** - VPS de teste
6. **Implementar Fase 1** - Fundação completa
7. **Testar conectividade** - Daemon → VPS
8. **Documentar learnings** - Ajustar plano

### Longo Prazo (Próximo Mês)
9. **Implementar Fases 2-4** - Funcionalidades core
10. **Deploy em produção** - Cutover planejado
11. **Monitorar e otimizar** - Ajustes baseados em uso real

## 🤔 Perguntas para Reflexão

1. **Múltiplos Clientes**: O sistema precisa suportar múltiplos clientes/empresas no mesmo VPS? Ou é dedicado?

2. **Latência Aceitável**: Qual delay é aceitável para um PDF ficar disponível após solicitação? (30s? 2min? 5min?)

3. **Volume de Dados**: Quantos PDFs novos por dia em média? Qual tamanho médio?

4. **Retenção**: 15 dias após evento é suficiente? Ou alguns tipos precisam ficar mais tempo?

5. **Priorização**: Alguns PDFs são mais críticos? (OS urgente vs orçamento antigo)

6. **Acesso Offline**: Frontend/mobile precisam funcionar offline? Cache local?

7. **Compliance**: Alguma regulamentação sobre onde dados podem ser armazenados? (LGPD, etc)

8. **Backup**: Precisa backup dos PDFs no servidor? Ou confiar que local sempre terá?

---

## 🎯 Conclusão

Esta arquitetura distribuída traz **grandes benefícios** em termos de acessibilidade, escalabilidade e flexibilidade, mas adiciona **complexidade significativa**.

### Recomendações:

1. ✅ **Vale a pena implementar** se:
   - Acesso remoto é necessário
   - Múltiplos técnicos em campo
   - Crescimento futuro esperado
   - Orçamento permite VPS

2. ⚠️ **Considerar alternativas** se:
   - Apenas uso local
   - Equipe pequena (<5 usuários)
   - Orçamento muito limitado
   - Time pequeno para manutenção

3. 🚀 **Abordagem Sugerida**:
   - Implementar por fases
   - Testar em staging extensivamente
   - Manter sistema atual como fallback
   - Migração gradual e reversível

### Está pronto para começar?

Aguardo seu feedback sobre:
- Decisões de infraestrutura
- Priorização de features
- Cronograma realista
- Recursos disponíveis (tempo/orçamento)

Então poderemos iniciar a implementação de forma estruturada! 🚀
