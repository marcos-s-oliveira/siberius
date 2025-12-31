# 🎯 Instalação Rápida

Instale o Siberius com **um comando**!

## Windows

```powershell
curl -o install.js https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js ; node install.js
```

Ou se `curl` não funcionar:

```powershell
# PowerShell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js" -OutFile "install.js"
node install.js
```

## Linux/Mac

```bash
wget https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js && node install.js
```

Ou:

```bash
curl -o install.js https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js && node install.js
```

---

## O Que Acontece?

1. ✅ Baixa o instalador do GitHub
2. ✅ Verifica pré-requisitos (Node.js, Git, PostgreSQL)
3. ✅ Clona o repositório completo
4. ✅ Compila backend e frontend localmente
5. ✅ Remove arquivos de desenvolvimento (src, node_modules, etc)
6. ✅ Configura banco de dados
7. ✅ Inicia serviços com PM2
8. ✅ Instalação final: ~50-100MB (só produção!)

---

## Instalação Completa (Git Clone)

Se preferir controle total:

```bash
# Clonar repositório
git clone https://github.com/SEU-USUARIO/siberius.git
cd siberius/installer

# Executar instalador
node install.js
```

---

## Pré-requisitos

Certifique-se de ter:
- ✅ Node.js 18+ → https://nodejs.org
- ✅ PostgreSQL 12+ → https://www.postgresql.org/download/
- ✅ Git → https://git-scm.com/

---

## Após Instalação

Acesse: **http://localhost:5173**

Gerenciar serviços:
```bash
pm2 status          # Ver status
pm2 logs            # Ver logs
pm2 restart all     # Reiniciar
```

---

**Lembre-se:** Substitua `SEU-USUARIO` pela sua conta GitHub!
