# Guia de Migração e Implantação - Siberius

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado e rodando
- Git (opcional, para clonar o repositório)

## 🚀 Implantação do Zero

### 1. Clonar/Copiar Projeto

```bash
# Se usando Git
git clone <repository-url> siberius
cd siberius

# Ou copiar os arquivos manualmente
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações
nano .env  # ou use seu editor preferido
```

### 3. Configurar Variáveis de Ambiente (.env)

Edite o arquivo `backend/.env`:

```env
# ==== SERVIDOR ====
API_PORT=3000

# ==== BANCO DE DADOS ====
DATABASE_URL="postgresql://usuario:senha@localhost:5432/siberius?schema=public"

# ==== SEGURANÇA ====
JWT_SECRET="sua-chave-secreta-unica-aqui"

# ==== INDEXADOR DE PDFs ====
# ATENÇÃO: Use caminho completo/absoluto
# Windows: C:\ServiceOrder
# Linux: /mnt/pdfs
PDF_DIRECTORY="C:\ServiceOrder"

# Intervalo de verificação (minutos)
CHECK_INTERVAL_MINUTES=10

# Logs detalhados
VERBOSE_LOGGING=true
```

### 4. Configurar Banco de Dados

```bash
# Criar banco de dados
psql -U postgres
CREATE DATABASE siberius;
\q

# Rodar migrations
npx prisma migrate deploy

# (Opcional) Popular com dados de exemplo
npx prisma db seed
```

### 5. Iniciar Backend

```bash
npm run dev
```

### 6. Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env (ajustar URL da API se necessário)
nano .env
```

### 7. Iniciar Frontend

```bash
npm run dev
```

## 🔄 Migração de Servidor Existente

### Cenário 1: Novo Servidor (Mesma Rede)

1. **Copiar projeto** para novo servidor
2. **Instalar dependências**: `npm install` (backend e frontend)
3. **Copiar arquivo .env** do servidor antigo
4. **Ajustar apenas `PDF_DIRECTORY`** no .env se o caminho mudou
5. **Backup do banco**: `pg_dump siberius > backup.sql`
6. **Restaurar banco** no novo servidor: `psql siberius < backup.sql`
7. **Iniciar serviços**

### Cenário 2: Mudar Diretório de PDFs

Edite apenas uma linha no `.env`:

```env
# Antes
PDF_DIRECTORY="C:\ServiceOrder"

# Depois
PDF_DIRECTORY="D:\NovoLocal\PDFs"
```

Reinicie o backend. Pronto!

### Cenário 3: Mudar Porta da API

Edite no `.env` do backend:

```env
API_PORT=8080  # ou qualquer porta disponível
```

Edite no `.env` do frontend:

```env
VITE_API_URL=http://localhost:8080
```

## 📝 Checklist de Implantação

### Backend
- [ ] Node.js instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado e configurado
- [ ] Variável `DATABASE_URL` correta
- [ ] Variável `PDF_DIRECTORY` apontando para pasta correta
- [ ] Migrations executadas (`npx prisma migrate deploy`)
- [ ] Servidor iniciado sem erros

### Frontend
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado
- [ ] Variável `VITE_API_URL` apontando para backend
- [ ] Build gerado (produção: `npm run build`)

## 🔧 Troubleshooting

### Erro: "PDF_DIRECTORY não existe"
**Solução**: Verifique se o caminho no `.env` está correto e se o diretório existe.

```bash
# Windows
dir "C:\ServiceOrder"

# Linux
ls -la /mnt/pdfs
```

### Erro: "Não foi possível conectar ao banco"
**Solução**: Verifique a `DATABASE_URL` no `.env`:
- Usuário e senha corretos?
- PostgreSQL está rodando? (`sudo service postgresql status`)
- Banco de dados existe? (`psql -l`)

### Erro: "Port already in use"
**Solução**: Mude a porta no `.env`:

```env
API_PORT=3001  # ou outra porta disponível
```

### PDFs não estão sendo indexados
**Solução**:
1. Verifique se `PDF_DIRECTORY` está correto
2. Verifique permissões de leitura na pasta
3. Ative logs detalhados: `VERBOSE_LOGGING=true`
4. Verifique console do backend para erros

## 🌐 Produção

### Backend (Linux/Ubuntu)

```bash
# Instalar PM2 para gerenciar processo
npm install -g pm2

# Iniciar com PM2
cd backend
pm2 start npm --name "siberius-api" -- run dev

# Auto-start no boot
pm2 startup
pm2 save
```

### Frontend (Nginx)

```bash
# Build
cd frontend
npm run build

# Copiar para Nginx
sudo cp -r dist/* /var/www/html/siberius/

# Configurar Nginx (arquivo /etc/nginx/sites-available/siberius)
```

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    root /var/www/html/siberius;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Variáveis de Ambiente - Referência Completa

### Backend (.env)

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `API_PORT` | Não | 3000 | Porta do servidor API |
| `DATABASE_URL` | Sim | - | URL de conexão PostgreSQL |
| `JWT_SECRET` | Sim | - | Chave para tokens JWT |
| `PDF_DIRECTORY` | Sim | - | Diretório dos PDFs (caminho absoluto) |
| `CHECK_INTERVAL_MINUTES` | Não | 10 | Intervalo de varredura (minutos) |
| `VERBOSE_LOGGING` | Não | true | Logs detalhados (true/false) |

### Frontend (.env)

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `VITE_API_URL` | Não | http://localhost:3000 | URL do backend |

## 🔐 Segurança

### Produção
- [ ] Alterar `JWT_SECRET` para valor único e longo
- [ ] Usar conexão PostgreSQL com senha forte
- [ ] Configurar HTTPS (Nginx + Let's Encrypt)
- [ ] Firewall configurado (apenas portas necessárias)
- [ ] Backups automáticos do banco de dados

### Backup

```bash
# Backup do banco
pg_dump siberius > backup_$(date +%Y%m%d).sql

# Backup do .env (CUIDADO: contém senhas!)
cp backend/.env backend/.env.backup
```

## 📞 Suporte

Em caso de problemas:
1. Verifique logs do backend (console)
2. Verifique logs do PostgreSQL
3. Verifique se todas as variáveis do `.env` estão corretas
4. Verifique permissões de arquivo/pasta
