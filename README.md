# 🚀 Siberius

> Sistema completo de gestão de ordens de serviço com interface touch-screen e indexação automática de PDFs

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://www.postgresql.org)

## ✨ Features

- 📅 **Calendário Semanal** - Visualização touch-friendly de ordens de serviço
- 👥 **Gestão de Equipes** - Alocação de técnicos e detecção de conflitos
- 📄 **Indexação Automática** - Scanner recursivo de PDFs com versionamento
- 🔐 **Autenticação Híbrida** - Login email/senha + PIN para touch screens
- 🖥️ **Interface Moderna** - React 19 com design responsivo
- 📊 **Dashboard Analytics** - Estatísticas e relatórios em tempo real
- 🔄 **Sincronização Live** - Socket.IO para atualizações instantâneas
- ⚙️ **Configuração Dinâmica** - Altere URLs sem recompilar

## 🚀 Instalação Rápida

### Um Comando (Recomendado)

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js" -OutFile "install.js" ; node install.js
```

**Linux/Mac:**
```bash
wget https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js && node install.js
```

### Ou Clone e Instale

```bash
git clone https://github.com/SEU-USUARIO/siberius.git
cd siberius/installer
node install.js
```

O instalador irá:
1. ✅ Baixar o código do GitHub (se necessário)
2. ✅ Compilar backend e frontend localmente
3. ✅ Configurar banco de dados PostgreSQL
4. ✅ Aplicar migrations do Prisma
5. ✅ Iniciar serviços com PM2
6. ✅ Limpar arquivos desnecessários (~50-100MB final)

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org) 18+
- [PostgreSQL](https://www.postgresql.org/download/) 12+
- [Git](https://git-scm.com/)

## 🏗️ Arquitetura

```
siberius/
├── backend/           # API REST + WebSocket
│   ├── src/          # Código TypeScript
│   ├── prisma/       # Schema e migrations
│   └── dist/         # Build de produção
├── frontend/         # Interface React
│   ├── src/          # Componentes React
│   └── dist/         # Build de produção
└── installer/        # Instalador automático
```

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT (jsonwebtoken)
- **WebSocket**: Socket.IO
- **PDF Parser**: pdf-parse

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Charts**: Recharts

## 📚 Documentação

- [📖 Guia de Instalação Completo](installer/README.md)
- [⚙️ Guia de Configuração](frontend/README_CONFIG.md)
- [🔧 Documentação do Backend](backend/README.md)
- [🎨 Documentação do Frontend](frontend/README.md)
- [📦 Como Publicar no GitHub](installer/PUBLICAR-GITHUB.md)

## 🎯 Uso

### Acessar o Sistema

Após instalação, acesse:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Gerenciar Serviços (PM2)

```bash
pm2 status              # Ver status dos serviços
pm2 logs                # Ver logs em tempo real
pm2 restart all         # Reiniciar serviços
pm2 stop all            # Parar serviços
```

### Configuração

As configurações podem ser editadas **sem recompilar**:

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:pass@host:5432/siberius"
API_PORT=3000
PDF_DIRECTORY=C:\ServiceOrder
```

**Frontend** (`frontend/dist/config.js`):
```javascript
window.SIBERIUS_CONFIG = {
  API_URL: 'http://192.168.1.100:3000',
  API_TIMEOUT: 10000
};
```

## 🔧 Desenvolvimento

### Setup Local

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edite .env com suas configurações
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Build para Produção

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se PostgreSQL está rodando
- Confirme credenciais no `.env`
- Execute migrations: `npx prisma migrate deploy`

### Frontend não conecta
- Verifique `dist/config.js` - API_URL correto?
- Backend está rodando na porta correta?
- Firewall bloqueando?

### Erro ao escanear PDFs
- Verifique se `PDF_DIRECTORY` existe
- Permissões de leitura na pasta?
- Formato dos PDFs está correto?

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adicionar MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

[Escolha sua licença: MIT, GPL-3.0, etc]

## 👨‍💻 Autor

[Seu Nome]  
[Seu Email]  
[Seu GitHub]

## 🌟 Agradecimentos

- Equipe de desenvolvimento
- Comunidade open source
- Usuários e testadores

---

**Desenvolvido com ❤️ para simplificar a gestão de ordens de serviço**

## 📊 Status do Projeto

- ✅ MVP Completo
- ✅ Sistema de Autenticação
- ✅ CRUD de Ordens de Serviço
- ✅ Gestão de Técnicos
- ✅ Calendário Semanal
- ✅ Scanner de PDFs
- ✅ Dashboard com Estatísticas
- ✅ Instalador Automático
- 🔄 Em desenvolvimento: Relatórios avançados
- 📋 Planejado: App mobile

---

**Star ⭐ este projeto se ele foi útil para você!**
