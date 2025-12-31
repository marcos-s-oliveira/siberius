# 🔧 Guia de Configuração - Siberius

## Frontend

### Configuração Dinâmica (Recomendado para Produção)

Edite o arquivo **`dist/config.js`** após fazer o build:

```javascript
window.SIBERIUS_CONFIG = {
  API_URL: 'http://192.168.1.100:3000',  // IP do servidor backend
  API_TIMEOUT: 10000,
  DEBUG: false
};
```

**Vantagens:**
- ✅ Pode ser editado sem recompilar
- ✅ Fácil de configurar em diferentes ambientes
- ✅ Não precisa rebuild para mudar a URL

### Configuração via Variáveis de Ambiente (Build-time)

Crie `.env.production` antes do build:

```bash
VITE_API_URL=http://servidor.empresa.com:3000
```

Ou configure na hora do build:
```bash
VITE_API_URL=http://192.168.1.100:3000 npm run build
```

---

## Backend

### Configuração Principal (.env)

Copie `.env.example` para `.env` e configure:

```env
# Servidor
PORT=3000
NODE_ENV=production

# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/siberius"

# Segurança
JWT_SECRET=seu_segredo_super_secreto_minimo_32_caracteres
JWT_EXPIRES_IN=12h

# PDFs (IMPORTANTE!)
PDF_DIRECTORY=/caminho/absoluto/para/pdfs
PDF_SCAN_INTERVAL=300
```

### Configurando o Caminho dos PDFs

**Windows:**
```env
PDF_DIRECTORY=C:/Documentos/Siberius/PDFs
# ou
PDF_DIRECTORY=C:\\Documentos\\Siberius\\PDFs
```

**Linux:**
```env
PDF_DIRECTORY=/var/data/siberius/pdfs
```

**Relativo ao projeto:**
```env
PDF_DIRECTORY=./pdfs
```

---

## Deploy em Produção

### 1. Frontend

```bash
cd frontend

# Fazer build
npm run build

# Editar configuração para produção
# Edite: dist/config.js
# Mude API_URL para o IP/domínio do servidor

# Servir com PM2
pm2 start ecosystem.config.cjs
```

### 2. Backend

```bash
cd backend

# Criar .env em produção
cp .env.example .env
nano .env  # Editar configurações

# Configurar:
# - DATABASE_URL com o PostgreSQL de produção
# - PDF_DIRECTORY com o caminho correto
# - JWT_SECRET com valor secreto forte

# Build e iniciar
npm run build
pm2 start dist/index.js --name siberius-backend
```

---

## Rede Local

Para acessar de outros dispositivos na mesma rede:

### 1. Descubra o IP do servidor:
```bash
# Windows
ipconfig

# Linux
ip addr show
```

### 2. Configure o frontend:
Edite `dist/config.js`:
```javascript
API_URL: 'http://192.168.1.100:3000'  // Use o IP descoberto
```

### 3. Acesse de outros dispositivos:
```
http://192.168.1.100:5173
```

---

## Troubleshooting

### Frontend não conecta ao backend

1. Verifique `dist/config.js` - API_URL está correto?
2. Firewall bloqueando a porta?
3. Backend está rodando? `pm2 status`

### Backend não encontra PDFs

1. Verifique `.env` - PDF_DIRECTORY está correto?
2. Teste o caminho: `ls /caminho/configurado`
3. Permissões de leitura? `chmod -R 755 /caminho/pdfs`

### Erro de autenticação

1. JWT_SECRET configurado?
2. Token expirou? (padrão 12h)
