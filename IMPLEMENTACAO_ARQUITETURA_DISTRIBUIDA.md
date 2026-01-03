# 🚀 Implementação: Arquitetura Distribuída

## 📌 Status Atual

**Branch:** `feature/distributed-architecture`  
**Base:** `v1.0.0-stable` (commit: e5b7e75)  
**Início:** 03/01/2026

## 🎯 Objetivo

Migrar de uma arquitetura monolítica local para uma arquitetura híbrida distribuída:

```
┌─────────────────┐         ┌─────────────────┐
│  Sistema Atual  │   →     │  Sistema Futuro │
│   (Monolítico)  │         │   (Distribuído) │
└─────────────────┘         └─────────────────┘
                                      
   Local Only              Cloud + Local Daemon
```

### Principais Mudanças

**De:**
- Backend + Frontend + BD rodando localmente
- Acesso apenas na rede local
- PDFs armazenados localmente

**Para:**
- Backend + Frontend + BD na VPS (https://sysfutura.prismasolutions.info)
- Daemon local leve (stateless, sem BD)
- PDFs enviados sob demanda com cache de 15 dias
- Acesso global via HTTPS

## 📋 Plano de Implementação

### ✅ Fase 0: Preparação (CONCLUÍDA)

- [x] Análise completa da arquitetura
- [x] Documentação detalhada (ARQUITETURA_DISTRIBUIDA_ANALISE.md)
- [x] Commit da versão estável (v1.0.0-stable)
- [x] Criação da branch feature/distributed-architecture
- [x] Definição de requisitos e especificações

### 🔄 Fase 1: Fundação VPS (1-2 semanas)

#### 1.1 Setup Infraestrutura
- [ ] Provisionar VPS (escolher provedor)
- [ ] Configurar domínio DNS
- [ ] Instalar Node.js, PostgreSQL, Nginx
- [ ] Configurar firewall e segurança
- [ ] Setup SSL com Let's Encrypt
- [ ] Testar conectividade básica

#### 1.2 Preparar Backend para Nuvem
- [ ] Adicionar Socket.IO ao backend existente
- [ ] Criar namespace `/daemon` para comunicação
- [ ] Criar namespace `/client` para frontend/mobile
- [ ] Implementar autenticação de daemon
- [ ] Criar endpoints para daemon (`/api/daemon/*`)
- [ ] Setup variáveis de ambiente para produção

#### 1.3 Migrations de Banco de Dados
- [ ] Criar tabela `daemon_clients`
- [ ] Criar tabela `pdf_cache`
- [ ] Criar tabela `pdf_transfers`
- [ ] Adicionar índices otimizados
- [ ] Testar migrations em staging

#### 1.4 Storage de PDFs
- [ ] Criar estrutura de diretórios no VPS
- [ ] Implementar upload de arquivos
- [ ] Implementar download seguro
- [ ] Sistema de expiração de cache
- [ ] Job de limpeza automática

### 🔄 Fase 2: Daemon Local (1-2 semanas)

#### 2.1 Estrutura Básica
- [ ] Criar projeto `daemon/` (Node.js + TypeScript)
- [ ] Setup package.json e tsconfig
- [ ] Estrutura de pastas (src/config/utils/services)
- [ ] Configuração via .env
- [ ] Sistema de logs (winston)

#### 2.2 Conectividade
- [ ] Socket.IO client
- [ ] Autenticação com token
- [ ] Heartbeat (ping/pong a cada 30s)
- [ ] Reconexão automática com backoff
- [ ] Detecção de rede (IPs local e público)

#### 2.3 Indexação de PDFs
- [ ] File watcher (chokidar) para diretório
- [ ] Integrar PDFParser existente
- [ ] Cálculo de hash (SHA-256)
- [ ] Cache em memória (evitar reprocessamento)
- [ ] Envio de metadados via Socket

#### 2.4 Upload de PDFs
- [ ] Handler de requisição de upload
- [ ] Upload via HTTP multipart
- [ ] Progress tracking
- [ ] Retry lógica (3 tentativas)
- [ ] Validação de hash no servidor

### 🔄 Fase 3: Integração Frontend (1 semana)

#### 3.1 Modificações na UI
- [ ] Verificar status do PDF antes de exibir
- [ ] Botão "Solicitar PDF" quando não está em cache
- [ ] Indicador de progresso de upload
- [ ] Mensagens de erro amigáveis
- [ ] Atualização em tempo real via Socket

#### 3.2 Nova Tela: Monitoramento de Daemons
- [ ] Criar `SystemMonitor.tsx`
- [ ] Rota `/admin/system-monitor`
- [ ] Cards de resumo (daemons, cache, uptime)
- [ ] Tabela de daemons conectados
- [ ] Modal de detalhes do daemon
- [ ] Gráficos e métricas
- [ ] Alertas e notificações

#### 3.3 API Client
- [ ] Endpoint `/api/admin/daemons`
- [ ] Endpoint `/api/pdfs/:id/status`
- [ ] Endpoint `/api/pdfs/:id/request`
- [ ] Socket listeners para atualizações
- [ ] Tratamento de erros

### 🔄 Fase 4: Deploy e Testes (1 semana)

#### 4.1 Deploy Backend no VPS
- [ ] Build do backend (TypeScript → JavaScript)
- [ ] Configurar PM2 para produção
- [ ] Setup Nginx como reverse proxy
- [ ] Testar endpoints da API
- [ ] Testar WebSocket
- [ ] Configurar logs

#### 4.2 Deploy Frontend
- [ ] Build do frontend (Vite)
- [ ] Deploy no Nginx
- [ ] Configurar cache de assets
- [ ] Testar todas as rotas
- [ ] Verificar HTTPS

#### 4.3 Instalação do Daemon
- [ ] Criar instalador simplificado
- [ ] Documentar processo de instalação
- [ ] Testar em Windows
- [ ] Testar em Linux
- [ ] Criar service/daemon do SO

#### 4.4 Testes End-to-End
- [ ] Fluxo completo: indexação → solicitação → upload → download
- [ ] Teste de reconexão (simular queda de rede)
- [ ] Teste de múltiplos daemons simultâneos
- [ ] Teste de expiração de cache
- [ ] Teste de performance (100+ PDFs)

### 🔄 Fase 5: Monitoramento e Otimização (1 semana)

#### 5.1 Observabilidade
- [ ] Dashboard de métricas
- [ ] Logs estruturados
- [ ] Alertas de problemas
- [ ] Health checks automatizados
- [ ] Analytics de uso

#### 5.2 Otimizações
- [ ] Compressão de PDFs (opcional)
- [ ] Thumbnails/previews
- [ ] CDN para assets estáticos
- [ ] Cache HTTP
- [ ] Rate limiting

#### 5.3 Documentação
- [ ] Guia de instalação do daemon
- [ ] Documentação da API
- [ ] Troubleshooting comum
- [ ] Runbooks de operação
- [ ] Atualizar README principal

### 🔄 Fase 6: Migração e Cutover (1 semana)

#### 6.1 Preparação
- [ ] Backup completo do sistema atual
- [ ] Migração de dados de staging para produção
- [ ] Verificar todas as funcionalidades
- [ ] Treinar usuários

#### 6.2 Cutover
- [ ] Deploy final em produção
- [ ] Migrar DNS para VPS
- [ ] Instalar daemons nos clientes
- [ ] Monitorar primeiras horas
- [ ] Suporte ativo

#### 6.3 Pós-Deploy
- [ ] Coletar feedback
- [ ] Ajustes e correções
- [ ] Otimizações baseadas em uso real
- [ ] Merge para main
- [ ] Release v2.0.0

## 📊 Cronograma Estimado

```
Semana 1-2:  Fase 1 - Fundação VPS
Semana 3-4:  Fase 2 - Daemon Local
Semana 5:    Fase 3 - Integração Frontend
Semana 6:    Fase 4 - Deploy e Testes
Semana 7:    Fase 5 - Monitoramento
Semana 8:    Fase 6 - Migração
───────────────────────────────────────
Total:       ~8 semanas (2 meses)
```

## 🔄 Rollback Strategy

Se algo der errado durante a migração:

### Opção 1: Rollback Completo
```bash
# Voltar para versão estável
git checkout v1.0.0-stable

# Restaurar backend local
cd backend && npm install && npm start

# Restaurar frontend
cd frontend && npm install && npm run dev
```

### Opção 2: Rollback Parcial
- Manter VPS no ar (sem afetar quem já migrou)
- Cliente específico volta para versão local
- Investigar problema isoladamente

## 📝 Notas de Desenvolvimento

### Convenções de Commit

Durante esta feature branch, usar:

```
feat(daemon): adicionar autenticação com token
feat(backend): criar endpoint /api/daemon/upload
fix(daemon): corrigir reconexão após timeout
docs: atualizar guia de instalação do daemon
test(e2e): adicionar testes de upload de PDF
```

### Ambiente de Desenvolvimento

**Backend Local (para testes):**
```bash
cd backend
npm run dev
# Roda na porta 3000
```

**Daemon Local (conecta ao VPS de staging):**
```bash
cd daemon
npm run dev
# Configura SERVER_URL=https://staging.sysfutura.prismasolutions.info
```

**Frontend Local:**
```bash
cd frontend
npm run dev
# Aponta para VPS de staging
```

### Ambientes

1. **Local**: Desenvolvimento individual
2. **Staging**: Testes integrados (staging.sysfutura.prismasolutions.info)
3. **Production**: Produção final (sysfutura.prismasolutions.info)

## 🎯 Critérios de Sucesso

Para considerar a implementação completa:

- ✅ Backend rodando estável no VPS
- ✅ Frontend acessível via HTTPS
- ✅ Pelo menos 1 daemon conectado e funcional
- ✅ PDFs sendo indexados automaticamente
- ✅ Upload sob demanda funcionando
- ✅ Cache de 15 dias operando corretamente
- ✅ Dashboard de monitoramento exibindo dados
- ✅ Mobile app conectando ao VPS
- ✅ Documentação completa
- ✅ Nenhum bug crítico

## 📞 Contatos e Recursos

**VPS Candidatos:**
- DigitalOcean: https://www.digitalocean.com/
- Contabo: https://contabo.com/
- Oracle Cloud (Free Tier): https://www.oracle.com/cloud/free/

**Documentação de Referência:**
- Socket.IO: https://socket.io/docs/
- Nginx: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/
- PM2: https://pm2.keymetrics.io/

## 🚧 Work in Progress

**Última atualização:** 03/01/2026  
**Status:** Iniciando Fase 1  
**Próximo:** Escolher provedor VPS e provisionar servidor

---

**⚠️ Importante:** Esta branch está em desenvolvimento ativo. Para usar a versão estável, faça checkout de `main` ou use a tag `v1.0.0-stable`.

```bash
# Voltar para versão estável
git checkout v1.0.0-stable
```
