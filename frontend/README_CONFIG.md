# 📋 README - Sistema de Configuração

## ✅ Solução Implementada

Sistema de configuração **flexível e robusto** que permite editar configurações em produção **sem recompilar**.

---

## 🎯 Frontend - Configuração Dinâmica

### Como Funciona

1. Arquivo [`public/config.js`](public/config.js) é copiado para `dist/config.js` no build
2. Carregado antes do React inicializar
3. **Pode ser editado diretamente em produção**

### Uso em Produção

Após fazer `npm run build`, edite **`dist/config.js`**:

```javascript
window.SIBERIUS_CONFIG = {
  // Mude para o IP/domínio do servidor backend
  API_URL: 'http://192.168.1.100:3000',
  API_TIMEOUT: 10000,
  DEBUG: false
};
```

### Vantagens

✅ **Sem rebuild** - Edite e recarregue o navegador  
✅ **Flexível** - Cada ambiente pode ter sua própria configuração  
✅ **Simples** - Arquivo JavaScript puro, fácil de entender  
✅ **Fallback** - Se não existir, usa `.env` ou localhost

---

## 🎯 Backend - Configuração via .env

### Configurações Críticas

O arquivo `.env` na raiz do backend controla:

```env
# Backend
API_PORT=3000
NODE_ENV=production

# Banco de Dados
DATABASE_URL="postgresql://user:pass@host:5432/siberius"

# Segurança
JWT_SECRET=segredo_forte_minimo_32_caracteres
JWT_EXPIRES_IN=12h

# PDFs - AJUSTE PARA SEU AMBIENTE
PDF_DIRECTORY=C:\ServiceOrder
CHECK_INTERVAL_MINUTES=10
```

### Caminho dos PDFs

**⚠️ IMPORTANTE:** Configure o caminho correto dos PDFs:

```env
# Windows - Compartilhamento de rede
PDF_DIRECTORY=\\servidor\compartilhamento\PDFs

# Windows - Caminho local
PDF_DIRECTORY=C:\Documentos\Siberius\PDFs

# Linux - NFS/CIFS montado
PDF_DIRECTORY=/mnt/pdfs

# Desenvolvimento
PDF_DIRECTORY=./test-pdfs
```

---

## 🚀 Deploy Passo a Passo

### 1. Backend

```bash
cd backend

# Copiar exemplo e editar
cp .env.example .env
nano .env  # ou notepad .env no Windows

# Ajustar:
# - DATABASE_URL (PostgreSQL de produção)
# - PDF_DIRECTORY (caminho real dos PDFs)
# - JWT_SECRET (valor forte e único)

# Build
npm run build

# Iniciar
pm2 start dist/index.js --name siberius-backend
```

### 2. Frontend

```bash
cd frontend

# Build
npm run build

# Editar config
nano dist/config.js  # ou notepad dist/config.js

# Mudar API_URL para IP do servidor:
# API_URL: 'http://192.168.1.100:3000',

# Servir
pm2 start serve -- -s dist -p 5173 --name siberius-frontend
```

---

## 🌐 Acesso pela Rede Local

### Descobrir IP do Servidor

**Windows:**
```bash
ipconfig
# Procure por "Endereço IPv4"
```

**Linux:**
```bash
ip addr show
# ou
hostname -I
```

### Configurar

1. **Backend** `.env`:
   ```env
   API_PORT=3000
   ```

2. **Frontend** `dist/config.js`:
   ```javascript
   API_URL: 'http://192.168.1.100:3000'  // IP do servidor
   ```

3. **Firewall**: Libere as portas 3000 (backend) e 5173 (frontend)

4. **Acessar de qualquer dispositivo na rede**:
   ```
   http://192.168.1.100:5173
   ```

---

## 🔧 Exemplos de Cenários

### Cenário 1: Desenvolvimento Local
```javascript
// Frontend: dist/config.js
API_URL: 'http://localhost:3000'
```
```env
# Backend: .env
PDF_DIRECTORY=./test-pdfs
NODE_ENV=development
```

### Cenário 2: Servidor na Rede Local
```javascript
// Frontend: dist/config.js
API_URL: 'http://192.168.1.50:3000'
```
```env
# Backend: .env
PDF_DIRECTORY=\\192.168.1.100\compartilhamento\PDFs
NODE_ENV=production
API_PORT=3000
```

### Cenário 3: Produção com Domínio
```javascript
// Frontend: dist/config.js
API_URL: 'https://api.siberius.empresa.com'
```
```env
# Backend: .env
PDF_DIRECTORY=/var/data/siberius/pdfs
NODE_ENV=production
API_PORT=3000
```

---

## 🐛 Troubleshooting

### Frontend não conecta ao backend

1. ✅ Verificar `dist/config.js` - API_URL correto?
2. ✅ Backend está rodando? `pm2 status`
3. ✅ Porta 3000 acessível? `curl http://IP:3000/api/health`
4. ✅ Firewall bloqueando?

### Backend não encontra PDFs

1. ✅ `.env` - PDF_DIRECTORY correto?
2. ✅ Caminho existe? `ls caminho` ou `dir caminho`
3. ✅ Permissões de leitura? `chmod 755` (Linux)
4. ✅ Compartilhamento montado? (se usar rede)

### Mudanças não aparecem

- **Frontend**: Limpe cache do navegador (Ctrl+Shift+Delete)
- **Backend**: Reinicie: `pm2 restart siberius-backend`

---

## 📚 Arquivos de Configuração

| Arquivo | Propósito | Quando Editar |
|---------|-----------|---------------|
| `frontend/public/config.js` | Template de config | Antes do build |
| `frontend/dist/config.js` | Config em produção | Após build, quando mudar ambiente |
| `backend/.env` | Config do backend | Em cada ambiente diferente |
| `backend/.env.example` | Template (não usar!) | Nunca, é só exemplo |

---

## 🎓 Resumo

**Frontend**: Edite `dist/config.js` quando mudar de ambiente  
**Backend**: Edite `.env` com caminhos e configs do servidor  
**Resultado**: Sistema configurável sem necessidade de recompilar! 🎉
