# 🧪 Teste Rápido do Instalador

## ⚡ Como Testar (5 minutos)

### 1️⃣ Pré-requisitos

Certifique-se de ter instalado:
- ✅ Node.js 18+ → https://nodejs.org
- ✅ PostgreSQL 12+ → https://www.postgresql.org/download/

**Verificar:**
```bash
node -v    # Deve mostrar v18.x ou superior
npm -v     # Deve mostrar versão
psql --version  # Deve mostrar PostgreSQL
```

### 2️⃣ Executar o Instalador

**Windows:**
```cmd
cd D:\Dev\siberius\installer
install.bat
```

**Linux/Mac:**
```bash
cd /caminho/para/siberius/installer
node install.js
```

### 3️⃣ Responder as Perguntas

O instalador vai perguntar:

```
🔌 Porta do Backend [3000]:        → Pressione Enter (usa padrão)
🌐 Porta do Frontend [5173]:       → Pressione Enter
🗄️  PostgreSQL Host [localhost]:  → Pressione Enter
🗄️  PostgreSQL Porta [5432]:      → Pressione Enter
👤 PostgreSQL Usuário [postgres]:  → Pressione Enter
🔑 PostgreSQL Senha:               → Digite sua senha do PostgreSQL
📊 Nome do Banco [siberius]:       → Pressione Enter
📁 Diretório dos PDFs:            → Digite: C:\Temp\PDFs (ou qualquer pasta)
```

💡 **Dica**: Use Enter para aceitar os valores padrão!

### 4️⃣ Confirmar Instalação

```
Continuar com a instalação? (s/n): s
```

### 5️⃣ PM2 (Opcional)

```
Deseja instalar e configurar o PM2? (s/n): s
```

**Recomendado para produção!**

### 6️⃣ Aguardar

O instalador vai:
- ⏳ Instalar dependências (~2-3 minutos)
- ⏳ Compilar backend e frontend (~1-2 minutos)
- ⏳ Aplicar migrations do banco
- 🚀 Iniciar os serviços

### 7️⃣ Testar!

Abra o navegador em:
```
http://localhost:5173
```

Você deve ver a tela de login do Siberius! 🎉

---

## ✅ Checklist de Sucesso

- [ ] Instalador executou sem erros
- [ ] Backend rodando na porta 3000
- [ ] Frontend rodando na porta 5173
- [ ] Página de login abre no navegador
- [ ] PM2 mostra os serviços rodando (`pm2 status`)

---

## 🔍 Verificar Serviços

### Com PM2:
```bash
pm2 status
```

Deve mostrar:
```
┌────┬─────────────────────┬─────────┬─────────┐
│ id │ name                │ status  │ cpu     │
├────┼─────────────────────┼─────────┼─────────┤
│ 0  │ siberius-backend    │ online  │ 0%      │
│ 1  │ siberius-frontend   │ online  │ 0%      │
└────┴─────────────────────┴─────────┴─────────┘
```

### Logs:
```bash
pm2 logs
```

---

## 🐛 Erros Comuns

### "PostgreSQL não encontrado"
- Instale: https://www.postgresql.org/download/
- Adicione ao PATH do sistema

### "Senha incorreta"
- Verifique a senha do PostgreSQL
- Teste manualmente: `psql -U postgres`

### "Porta já em uso"
- Outra aplicação está usando a porta
- Mude a porta durante instalação
- Ou pare a aplicação: `netstat -ano | findstr :3000`

### "npm install failed"
- Limpe o cache: `npm cache clean --force`
- Delete `node_modules` e tente novamente
- Verifique conexão com internet

---

## 🧹 Limpar e Testar Novamente

Se quiser testar do zero:

```bash
# Parar serviços
pm2 stop all
pm2 delete all

# Limpar banco
psql -U postgres -c "DROP DATABASE IF EXISTS siberius;"

# Executar instalador novamente
node install.js
```

---

## 📸 Screenshots Esperados

### Durante a Instalação:
```
╔═══════════════════════════════════════════════════════════╗
║          🚀  INSTALADOR SIBERIUS v1.0                    ║
╚═══════════════════════════════════════════════════════════╝

✅ Node.js v20.11.0 encontrado
✅ npm 10.2.4 encontrado
✅ PostgreSQL encontrado

===========================================================
  CONFIGURAÇÃO
===========================================================
...
```

### Após Instalação:
```
===========================================================
  INSTALAÇÃO CONCLUÍDA! 🎉
===========================================================

✅ Siberius instalado com sucesso!

🌐 ACESSE O SISTEMA:

   Frontend:  http://localhost:5173
   Backend:   http://localhost:3000

📊 COMANDOS PM2:

   Ver status:    pm2 status
   Ver logs:      pm2 logs
```

---

## 🎯 Próximos Passos Após Teste

1. ✅ Configurar primeiro usuário admin
2. ✅ Cadastrar técnicos
3. ✅ Apontar para pasta real dos PDFs
4. ✅ Testar scan de PDFs
5. ✅ Criar ordem de serviço de teste

---

## 💬 Precisa de Ajuda?

- Verifique os logs: `pm2 logs`
- Consulte: [README.md](README.md)
- Backend logs: `cd backend && node dist/index.js` (ver erros diretos)

---

**Tempo estimado**: 5-10 minutos ⏱️

**Boa sorte!** 🍀
