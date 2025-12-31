# ✅ Sistema de Configuração Implementado

## 🎯 Problema Resolvido

1. ❌ **Antes**: URL do backend hardcoded como `localhost` - não funcionava na rede
2. ❌ **Antes**: Caminho dos PDFs fixo - não funcionava em ambientes diferentes
3. ✅ **Agora**: Configuração **flexível e editável** sem recompilar!

---

## 📁 Arquivos Criados/Modificados

### Frontend

| Arquivo | Descrição |
|---------|-----------|
| ✨ `public/config.js` | **Configuração dinâmica** - editável após build |
| 📝 `index.html` | Carrega config.js antes do React |
| 🔧 `src/services/api.ts` | Usa config.js com fallback para .env |
| 📘 `src/vite-env.d.ts` | Tipagem TypeScript para SIBERIUS_CONFIG |
| 📚 `README_CONFIG.md` | **Guia completo** de configuração |
| 🚀 `deploy.sh` | Script automatizado de deploy (Linux/Mac) |
| 🚀 `deploy.bat` | Script automatizado de deploy (Windows) |
| 📖 `README.md` | Atualizado com instruções |

### Backend

| Arquivo | Descrição |
|---------|-----------|
| 🔧 `.env.example` | Atualizado com todas as variáveis (PDF_DIRECTORY, JWT, etc) |

---

## 🎨 Como Funciona

### Frontend - Configuração Dinâmica

```javascript
// public/config.js (vai para dist/config.js no build)
window.SIBERIUS_CONFIG = {
  API_URL: 'http://localhost:3000',  // 👈 EDITÁVEL EM PRODUÇÃO!
  API_TIMEOUT: 10000,
  DEBUG: false
};
```

**Fluxo:**
1. Build: `npm run build` → copia `public/config.js` para `dist/config.js`
2. HTML carrega `dist/config.js` antes do React
3. `api.ts` lê `window.SIBERIUS_CONFIG.API_URL`
4. **Em produção**: Edite `dist/config.js` com o IP real → refresh browser ✅

### Backend - Variáveis de Ambiente

```env
# .env
PDF_DIRECTORY=C:\ServiceOrder  # 👈 Caminho dos PDFs
API_PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

---

## 🚀 Deploy Rápido

### Opção 1: Scripts Automáticos

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

O script faz:
1. ✅ Build do projeto
2. ✅ Pergunta IP do backend
3. ✅ Atualiza `dist/config.js` automaticamente
4. ✅ Inicia com PM2 (opcional)

### Opção 2: Manual

```bash
# 1. Build
npm run build

# 2. Editar config
nano dist/config.js
# Mude: API_URL: 'http://192.168.1.100:3000'

# 3. Servir
pm2 start serve -- -s dist -p 5173 --name siberius-frontend
```

---

## 💡 Exemplos Práticos

### Desenvolvimento Local
```javascript
// dist/config.js
API_URL: 'http://localhost:3000'
```

### Servidor na Rede
```javascript
// dist/config.js
API_URL: 'http://192.168.1.50:3000'
```

### Produção
```javascript
// dist/config.js
API_URL: 'https://api.siberius.empresa.com'
```

---

## ✨ Vantagens da Solução

| Recurso | Benefício |
|---------|-----------|
| 🔄 **Sem rebuild** | Edite config.js e recarregue o browser |
| 🌐 **Multi-ambiente** | Mesma build funciona em dev/staging/prod |
| 💾 **Backup simples** | Um arquivo config.js por ambiente |
| 🔒 **Tipo-safe** | TypeScript valida a configuração |
| 🎯 **Fallback inteligente** | config.js → .env → localhost |
| 📦 **Portável** | Copie dist/ para qualquer servidor |

---

## 🎓 Resumo

**Frontend:**
- ✅ Edite `dist/config.js` quando mudar de servidor
- ✅ Não precisa recompilar
- ✅ Use os scripts `deploy.sh` ou `deploy.bat`

**Backend:**
- ✅ Configure `.env` uma vez por ambiente
- ✅ Defina `PDF_DIRECTORY` com o caminho correto
- ✅ Reinicie o serviço ao mudar

**Resultado:**
- ✅ Sistema totalmente configurável
- ✅ Funciona em qualquer rede/ambiente
- ✅ Produção, desenvolvimento, staging - tudo coberto!

---

## 📚 Documentação Completa

- 📖 [README_CONFIG.md](README_CONFIG.md) - Guia detalhado de configuração
- 📖 [CONFIG_GUIDE.md](CONFIG_GUIDE.md) - Troubleshooting e cenários
- 📖 [README.md](README.md) - Documentação geral

---

## 🎉 Pronto para Usar!

```bash
# Build
npm run build

# Deploy
./deploy.sh    # Linux/Mac
deploy.bat     # Windows
```

**Ou manualmente:**
1. Edite `dist/config.js`
2. Inicie o servidor: `pm2 start serve -- -s dist -p 5173`
3. Acesse: `http://seu-ip:5173`

✅ **Configuração robusta, flexível e pronta para produção!**
