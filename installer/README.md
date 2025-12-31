# � Instalador Siberius

## ✅ Instalador Automático Implementado!

**Instalador interativo e amigável via terminal**

Execute `install.bat` (Windows) ou `node install.js` (Linux/Mac) e siga as instruções!

---

## 📋 Pré-requisitos

Antes de executar o instalador, certifique-se de ter:

- ✅ **Node.js** (versão 18+) - [Download](https://nodejs.org)
- ✅ **PostgreSQL** (versão 12+) - [Download](https://www.postgresql.org/download/)
- ✅ **Git** (opcional) - [Download](https://git-scm.com/)

---

## 🎯 Como Usar

### Windows

1. Abra o **Prompt de Comando** ou **PowerShell** como Administrador
2. Navegue até a pasta do instalador:
   ```cmd
   cd D:\Dev\siberius\installer
   ```
3. Execute o instalador:
   ```cmd
   install.bat
   ```

### Linux/Mac

1. Abra o **Terminal**
2. Navegue até a pasta do instalador:
   ```bash
   cd /caminho/para/siberius/installer
   ```
3. Execute o instalador:
   ```bash
   node install.js
   ```

---

## 📝 O que o Instalador Faz

O instalador automatiza todo o processo de configuração:

1. ✅ **Verifica pré-requisitos** (Node.js, npm, PostgreSQL)
2. ✅ **Coleta informações** de configuração (portas, banco de dados, PDFs)
3. ✅ **Instala dependências** do backend e frontend
4. ✅ **Cria arquivo .env** com as configurações fornecidas
5. ✅ **Aplica migrations** do banco de dados
6. ✅ **Compila** backend e frontend
7. ✅ **Configura PM2** (opcional) para gerenciar os serviços
8. ✅ **Inicia os serviços** automaticamente

---

## 🎨 Interface

O instalador apresenta uma interface amigável no terminal:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          🚀  INSTALADOR SIBERIUS v1.0                    ║
║                                                           ║
║          Sistema de Gestão de Ordens de Serviço         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## ⚙️ Configurações Solicitadas

Durante a instalação, você será perguntado sobre:

| Configuração | Padrão | Descrição |
|--------------|--------|-----------|
| Porta do Backend | 3000 | Porta onde a API REST vai rodar |
| Porta do Frontend | 5173 | Porta onde a interface web vai rodar |
| PostgreSQL Host | localhost | Endereço do servidor PostgreSQL |
| PostgreSQL Porta | 5432 | Porta do PostgreSQL |
| PostgreSQL Usuário | postgres | Usuário do banco de dados |
| PostgreSQL Senha | (sem padrão) | Senha do banco de dados |
| Nome do Banco | siberius | Nome do banco de dados |
| Diretório PDFs | C:\ServiceOrder | Pasta onde os PDFs serão escaneados |

**Dica**: Pressione Enter para usar os valores padrão!

---

## 📊 Após a Instalação

### Acessar o Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Comandos PM2 (se instalado)

```bash
# Ver status dos serviços
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs de um serviço específico
pm2 logs siberius-backend
pm2 logs siberius-frontend

# Reiniciar serviços
pm2 restart all
pm2 restart siberius-backend
pm2 restart siberius-frontend

# Parar serviços
pm2 stop all

# Remover serviços
pm2 delete all
```

### Iniciar Manualmente (sem PM2)

**Backend:**
```bash
cd backend
node dist/index.js
```

**Frontend:**
```bash
cd frontend
npx serve -s dist -p 5173
```

---

## 🐛 Troubleshooting

### Erro: "Node.js não encontrado"

Instale o Node.js: https://nodejs.org

### Erro: "PostgreSQL não encontrado"

Instale o PostgreSQL: https://www.postgresql.org/download/

### Erro: "Falha ao conectar ao banco de dados"

1. Verifique se o PostgreSQL está rodando
2. Confirme usuário e senha
3. Crie o banco manualmente:
   ```sql
   CREATE DATABASE siberius;
   ```

### Erro: "Porta já em uso"

Mude as portas durante a instalação ou pare o serviço que está usando a porta.

### Erro nas Migrations

Execute manualmente:
```bash
cd backend
npx prisma migrate deploy
```

---

## 🔄 Reinstalar

Para reinstalar ou atualizar:

1. Pare os serviços:
   ```bash
   pm2 stop all
   pm2 delete all
   ```

2. Execute o instalador novamente:
   ```bash
   node install.js
   ```

---

## 📚 Mais Informações

- [Guia de Configuração](../frontend/README_CONFIG.md)
- [Documentação Backend](../backend/README.md)
- [Documentação Frontend](../frontend/README.md)

---

## 💡 Dicas

- Use **valores padrão** (Enter) para desenvolvimento local
- Em **produção**, configure caminhos absolutos para PDFs
- Mantenha o **JWT_SECRET** seguro (gerado automaticamente)
- Configure **backup** do banco de dados regularmente

---

## 🎯 Próximos Passos

Após a instalação:

1. Acesse http://localhost:5173
2. Faça login com usuário admin (configure via API)
3. Configure técnicos e usuários
4. Aponte PDF_DIRECTORY para a pasta com os PDFs
5. O sistema começará a escanear automaticamente!

---

**Desenvolvido para simplificar o deploy do Siberius** 🚀
