# 📦 Publicar Siberius no GitHub

## 🎯 Passo 1: Preparar o Repositório

### Criar .gitignore (se não existir)

Crie um arquivo `.gitignore` na raiz:

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment files
.env
.env.local
.env.production

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Database
*.db
*.sqlite

# Temp
tmp/
temp/
*.tmp

# Prisma
backend/prisma/migrations/*/migration.sql

# Test PDFs (se tiver)
test-pdfs/
*.pdf
```

## 🎯 Passo 2: Publicar no GitHub

### Se o repositório NÃO existe ainda:

```bash
cd D:\Dev\siberius

# Inicializar Git (se ainda não foi)
git init

# Adicionar arquivos
git add .

# Primeiro commit
git commit -m "Initial commit: Sistema Siberius completo"

# Criar repositório no GitHub:
# 1. Acesse https://github.com/new
# 2. Nome: siberius
# 3. Descrição: Sistema de Gestão de Ordens de Serviço
# 4. Público ou Privado (sua escolha)
# 5. NÃO marque "Initialize with README" (já temos)
# 6. Clique em "Create repository"

# Conectar ao repositório remoto (copie a URL que o GitHub mostrar)
git remote add origin https://github.com/SEU-USUARIO/siberius.git

# Fazer push
git branch -M main
git push -u origin main
```

### Se o repositório JÁ existe:

```bash
cd D:\Dev\siberius

# Adicionar arquivos novos/modificados
git add .

# Commit
git commit -m "Adicionar instalador automático e configuração dinâmica"

# Push
git push origin main
```

## 🎯 Passo 3: Atualizar a URL no Instalador

Edite `installer/install.js` linha 13:

```javascript
const GITHUB_REPO = 'https://github.com/SEU-USUARIO/siberius.git';
```

Substitua `SEU-USUARIO` pelo seu usuário do GitHub.

**Exemplo:**
```javascript
const GITHUB_REPO = 'https://github.com/joaosilva/siberius.git';
```

Depois faça commit dessa mudança:

```bash
git add installer/install.js
git commit -m "Atualizar URL do repositório GitHub no instalador"
git push
```

## 🎯 Passo 4: Criar um README Atraente no GitHub

Crie/atualize `README.md` na raiz:

```markdown
# 🚀 Siberius

Sistema completo de gestão de ordens de serviço com interface touch-screen e indexação automática de PDFs.

## ✨ Features

- 📅 Calendário semanal de ordens de serviço
- 👥 Gestão de equipes e técnicos
- 📄 Indexação automática de PDFs
- 🔐 Autenticação JWT (email/senha + PIN)
- 🖥️ Interface touch-friendly
- 📊 Dashboard com estatísticas
- 🔄 Sincronização em tempo real (Socket.IO)

## 🚀 Instalação Rápida

### Windows:
\```bash
curl -o install.js https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js
node install.js
\```

### Linux/Mac:
\```bash
wget https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js
node install.js
\```

O instalador irá:
- ✅ Baixar o código do GitHub
- ✅ Compilar backend e frontend
- ✅ Configurar banco de dados
- ✅ Iniciar serviços automaticamente
- ✅ Limpar arquivos desnecessários

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- Git

## 🛠️ Tecnologias

**Backend:**
- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT + Socket.IO

**Frontend:**
- React 19
- TypeScript
- Vite
- Axios

## 📚 Documentação

- [Guia de Configuração](frontend/README_CONFIG.md)
- [Documentação Backend](backend/README.md)
- [Documentação Frontend](frontend/README.md)

## 📝 Licença

[Escolha sua licença: MIT, GPL, etc]

## 👨‍💻 Autor

[Seu Nome]
```

## 🎯 Passo 5: Testar o Instalador

Agora qualquer pessoa pode instalar o Siberius com um comando!

**Windows:**
```cmd
curl -o install.js https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js
node install.js
```

**Linux/Mac:**
```bash
wget https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js
node install.js
```

Ou clonar e executar:
```bash
git clone https://github.com/SEU-USUARIO/siberius.git
cd siberius/installer
node install.js
```

## 🎯 Passo 6: (Opcional) Criar Releases

No GitHub, crie uma release:

1. Vá em "Releases" → "Create a new release"
2. Tag: `v1.0.0`
3. Title: "Siberius v1.0.0 - Primeira Release"
4. Descrição:
```markdown
## 🎉 Primeira versão estável do Siberius!

### Features:
- ✅ Sistema completo de gestão de OS
- ✅ Interface touch-screen
- ✅ Indexação automática de PDFs
- ✅ Instalador automático

### Instalação:
\```bash
curl -o install.js https://raw.githubusercontent.com/SEU-USUARIO/siberius/v1.0.0/installer/install.js
node install.js
\```
```

## ✅ Checklist de Publicação

- [ ] `.gitignore` criado
- [ ] Remover arquivos sensíveis (senhas, .env)
- [ ] README.md atraente criado
- [ ] Repositório criado no GitHub
- [ ] Código enviado (git push)
- [ ] URL no instalador atualizada
- [ ] Instalador testado
- [ ] Release criada (opcional)
- [ ] Documentação revisada

## 🔒 Segurança

**NUNCA commite:**
- ❌ `.env` com senhas reais
- ❌ `node_modules/`
- ❌ Arquivos de banco de dados
- ❌ Chaves privadas ou tokens

**Use `.env.example`** com valores de exemplo!

## 📊 Benefícios

Agora você tem:
- ✅ Código versionado no GitHub
- ✅ Instalador que baixa do GitHub
- ✅ Builds locais (mais seguros)
- ✅ Limpeza automática de arquivos desnecessários
- ✅ Instalação de ~50-100MB ao invés de 200+MB
- ✅ Fácil distribuição e atualização

## 🎯 Próximos Passos

1. Publicar no GitHub
2. Atualizar URL no instalador
3. Testar instalação limpa
4. Compartilhar com usuários!

---

**Pronto para publicar!** 🚀
