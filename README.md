# Siberius - Sistema de Indexação de PDFs

Sistema backend para indexação automática de arquivos PDF de ordens de serviço.

## 📋 Funcionalidades

- ✅ Indexação automática de arquivos PDF
- ✅ **Varredura recursiva** em todas as subpastas
- ✅ Parse inteligente de nomes de arquivos com estrutura específica
- ✅ Suporte para arquivos de OS atualizadas
- ✅ Verificação periódica configurável
- ✅ Banco de dados PostgreSQL com Prisma ORM
- ✅ Sistema de configuração via arquivo `.conf`
- ✅ Tratamento robusto de erros de acesso a arquivos/pastas

## 🗂️ Estrutura de Arquivos PDF

O sistema escaneia **recursivamente** toda a estrutura de diretórios a partir do caminho configurado.

**Exemplo de estrutura suportada:**
```
orcamentos/
  └── empresa2025/
      └── clientes/
          ├── clienteA/
          │   ├── 12345 - João Silva - Manutenção - 25.12.2025.pdf
          │   └── 12346 - O.S ATUALIZADA - João Silva - Manutenção - 26.12.2025.pdf
          └── clienteB/
              └── 12347 - Maria Santos - Instalação - 27.12.2025.pdf
```

Os arquivos PDF devem seguir uma das seguintes estruturas:

**Formato padrão:**
```
$OSNumber - $ClientName - $EventName - $date(DD.MM.YYYY).pdf
```

**Formato com atualização:**
```
$OSNumber - O.S ATUALIZADA - $ClientName - $EventName - $date(DD.MM.YYYY).pdf
```

### Exemplos:
- `12345 - João Silva - Manutenção - 25.12.2025.pdf`
- `12346 - O.S ATUALIZADA - Maria Santos - Instalação - 26.12.2025.pdf`

## 🔄 Gerenciamento de Versões de OS

O sistema possui controle inteligente de versões quando encontra ordens de serviço atualizadas:

### Como Funciona

1. **Primeira OS Indexada:**
   - Arquivo: `12345 - João Silva - Manutenção - 25.12.2025.pdf`
   - Sistema cria: OS nº 12345, versão 1, status `ativa=true`

2. **OS Atualizada Encontrada:**
   - Arquivo: `12345 - O.S ATUALIZADA - João Silva - Manutenção - 26.12.2025.pdf`
   - Sistema detecta que já existe OS com nº 12345
   - Marca a versão anterior como `ativa=false`
   - Cria nova versão: OS nº 12345, versão 2, status `ativa=true`
   - Mantém link com a versão original (`osOriginalId`)

3. **OS Duplicada sem marcação:**
   - Arquivo: `12345 - João Silva - Outro Evento - 27.12.2025.pdf`
   - Sistema detecta duplicação mas arquivo NÃO tem "O.S ATUALIZADA"
   - **Ação:** Pula o arquivo e loga aviso (evita duplicações acidentais)

### Benefícios

- ✅ **Histórico completo:** Todas as versões ficam registradas no banco
- ✅ **Versão ativa:** Campo `ativa` indica qual é a versão mais recente
- ✅ **Rastreabilidade:** Link entre versões via `osOriginalId`
- ✅ **Proteção:** Evita duplicação acidental de OSs com mesmo número
- ✅ **Auditoria:** Timestamps de `indexadoEm` e `atualizadoEm` para cada versão

## 👥 Gestão de Equipes e Agendamento

O sistema permite escalar múltiplos técnicos para uma mesma ordem de serviço e verifica automaticamente conflitos de agenda.

### Como Funciona

1. **Atendimento Individual:**
   - Vincula um técnico a uma OS
   - Verifica se técnico já está alocado na mesma data
   - Retorna avisos de conflito mas permite a criação

2. **Atendimento em Equipe:**
   - Vincula múltiplos técnicos de uma vez
   - Verifica conflitos para cada técnico
   - Evita duplicação (mesmo técnico, mesma OS)
   - Valida se técnicos estão ativos
   - Retorna relatório detalhado de sucessos e avisos

3. **Verificação de Agenda:**
   - Consulta todos os atendimentos de um técnico em uma data
   - Útil antes de escalar para verificar disponibilidade
   - Mostra status de cada atendimento

### Regras de Negócio

- ✅ Um técnico pode ser alocado em múltiplas OSs na mesma data (com aviso)
- ✅ Múltiplos técnicos podem atender a mesma OS (trabalho em equipe)
- ❌ Mesmo técnico não pode ser vinculado duas vezes à mesma OS
- ❌ Técnicos inativos não podem receber novos atendimentos
- ⚠️ Sistema avisa sobre conflitos mas não bloqueia (flexibilidade operacional)

## 📊 Estrutura do Banco de Dados

### Tabelas

#### 🗂️ ordens_servico
Armazena as ordens de serviço indexadas dos arquivos PDF.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| numeroOS | String | Número da ordem de serviço |
| versao | Int | Versão da OS (1, 2, 3...) |
| nomeCliente | String | Nome do cliente |
| nomeEvento | String | Nome do evento |
| data | DateTime | Data da ordem de serviço |
| osAtualizada | Boolean | Indica se é uma OS atualizada |
| caminhoArquivo | String | Caminho completo do arquivo (único) |
| caminhoRelativo | String? | Caminho relativo ao diretório base |
| nomeArquivo | String | Nome do arquivo PDF |
| osOriginalId | Int? | ID da OS original (para versões atualizadas) |
| ativa | Boolean | Indica se é a versão ativa/atual |
| indexadoEm | DateTime | Data/hora da indexação |
| atualizadoEm | DateTime | Data/hora da última atualização |

**Constraints:**
- `@@unique([numeroOS, versao])` - Combinação única de número + versão
- `@@index([numeroOS, ativa])` - Índice para buscar versão ativa

#### 👤 usuarios
Gerenciamento de usuários do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| nome | String | Nome do usuário |
| email | String | Email (único) |
| senha | String | Senha com hash bcrypt |
| pin | String? | PIN de 4-6 dígitos para tela touch |
| ativo | Boolean | Status ativo/inativo |
| criadoEm | DateTime | Data de criação |
| atualizadoEm | DateTime | Data da última atualização |

#### 🔧 tecnicos
Cadastro de técnicos que atendem as ordens de serviço.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| nome | String | Nome do técnico |
| email | String | Email (único) |
| telefone | String? | Telefone de contato |
| especialidade | String? | Especialidade do técnico |
| ativo | Boolean | Status ativo/inativo |
| criadoEm | DateTime | Data de criação |
| atualizadoEm | DateTime | Data da última atualização |

#### 📋 atendimentos_os
Relacionamento entre técnicos e ordens de serviço.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| ordemServicoId | Int | ID da ordem de serviço |
| tecnicoId | Int | ID do técnico |
| dataAtribuicao | DateTime | Data de atribuição |
| status | String | Status: pendente, em_andamento, concluido |
| observacoes | String? | Observações opcionais |
| criadoEm | DateTime | Data de criação |
| atualizadoEm | DateTime | Data da última atualização |

## 🌐 API REST

O sistema expõe uma API REST completa para gerenciamento dos dados.

**Base URL:** `http://localhost:3000/api`

### 🔐 Autenticação

O sistema oferece **dois métodos de autenticação**:

#### Login Completo (Web/Mobile)
`POST /auth/login`
- Email + senha
- Token JWT com validade de 12h
- Senhas armazenadas com bcrypt

#### Login Rápido (Tela Touch)
`POST /auth/login/pin`
- Usuário seleciona nome na lista (`GET /auth/usuarios`)
- Digita PIN de 4-6 dígitos
- Token JWT com validade de 12h
- Ideal para tela touch em sala de reuniões

#### Outros Endpoints de Auth
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/auth/usuarios` | Lista usuários para seleção (apenas id e nome) |
| GET | `/auth/verify` | Verifica se token é válido |
| POST | `/auth/refresh` | Renova token expirado |

### Endpoints de Ordens de Serviço

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/ordens-servico` | Lista todas as ordens de serviço |
| GET | `/ordens-servico/:id` | Busca por ID |
| GET | `/ordens-servico/numero/:numero` | Busca por número da OS |
| POST | `/ordens-servico` | Cria nova ordem de serviço |
| PUT | `/ordens-servico/:id` | Atualiza ordem de serviço |
| DELETE | `/ordens-servico/:id` | Remove ordem de serviço |

### Endpoints de Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/usuarios` | Lista todos os usuários |
| GET | `/usuarios/:id` | Busca usuário por ID |
| POST | `/usuarios` | Cria novo usuário |
| PUT | `/usuarios/:id` | Atualiza usuário |
| DELETE | `/usuarios/:id` | Remove usuário |

### Endpoints de Técnicos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/tecnicos` | Lista todos os técnicos |
| GET | `/tecnicos/:id` | Busca técnico por ID |
| POST | `/tecnicos` | Cria novo técnico |
| PUT | `/tecnicos/:id` | Atualiza técnico |
| DELETE | `/tecnicos/:id` | Remove técnico |

### Endpoints de Atendimentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/atendimentos` | Lista todos os atendimentos |
| GET | `/atendimentos/:id` | Busca atendimento por ID |
| GET | `/atendimentos/ordem-servico/:ordemServicoId` | Lista atendimentos de uma OS (equipe) |
| GET | `/atendimentos/tecnico/:tecnicoId` | Lista atendimentos de um técnico |
| GET | `/atendimentos/tecnico/:tecnicoId/agenda/:data` | Verifica agenda do técnico em data específica |
| POST | `/atendimentos` | Cria novo atendimento (1 técnico) |
| POST | `/atendimentos/equipe` | Cria atendimentos para múltiplos técnicos |
| PUT | `/atendimentos/:id` | Atualiza atendimento |
| DELETE | `/atendimentos/:id` | Remove atendimento |

**Recursos de Atendimentos:**
- ✅ Suporte para equipes (múltiplos técnicos por OS)
- ✅ Verificação automática de conflitos de agenda
- ✅ Aviso quando técnico já está alocado na mesma data
- ✅ Prevenção de duplicação (mesmo técnico na mesma OS)
- ✅ Validação de técnicos ativos

### Health Check

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Verifica status da API |

### 📝 Exemplos de Uso da API

#### Login Completo (Email + Senha)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teste.com",
    "senha": "123456"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@teste.com"
  },
  "expiresIn": "12h"
}
```

#### Login Rápido com PIN (Tela Touch)
```bash
# 1. Listar usuários disponíveis
curl http://localhost:3000/auth/usuarios

# 2. Login com PIN
curl -X POST http://localhost:3000/auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": 1,
    "pin": "1234"
  }'
```

#### Criar Usuário com PIN
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "senha123",
    "pin": "1234"
  }'
```

#### Usar Token em Requisições Protegidas
Após fazer login, use o token retornado no header `Authorization`:

```bash
# Exemplo: Atualizar usuário (requer autenticação)
curl -X PUT http://localhost:3000/api/usuarios/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "nome": "João Silva Atualizado"
  }'
```

**Nota:** Substitua `eyJhbGciOiJIUzI1NiIs...` pelo token JWT recebido no login.

#### Listar Ordens de Serviço
```bash
curl http://localhost:3000/api/ordens-servico
```

#### Buscar OS por Número
```bash
curl http://localhost:3000/api/ordens-servico/numero/12345
```

#### Criar Técnico
```bash
curl -X POST http://localhost:3000/api/tecnicos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999",
    "especialidade": "Manutenção"
  }'
```

#### Criar Atendimento
```bash
curl -X POST http://localhost:3000/api/atendimentos \
  -H "Content-Type: application/json" \
  -d '{
    "ordemServicoId": 1,
    "tecnicoId": 1,
    "status": "em_andamento",
    "observacoes": "Iniciando atendimento"
  }'
```

#### Listar Atendimentos de um Técnico
```bash
curl http://localhost:3000/api/atendimentos/tecnico/1
```

#### Verificar Agenda do Técnico
```bash
curl http://localhost:3000/api/atendimentos/tecnico/1/agenda/2025-12-28
```

#### Criar Atendimento com Verificação de Conflito
```bash
curl -X POST http://localhost:3000/api/atendimentos \
  -H "Content-Type: application/json" \
  -d '{
    "ordemServicoId": 1,
    "tecnicoId": 1,
    "status": "em_andamento",
    "observacoes": "Iniciando atendimento"
  }'
```

**Resposta com aviso de conflito:**
```json
{
  "atendimento": { ... },
  "avisos": [{
    "tipo": "conflito_agenda",
    "mensagem": "Técnico João já está alocado em 2 OS(s) na mesma data",
    "conflitos": [
      {
        "osNumero": "12345",
        "cliente": "Cliente A",
        "data": "2025-12-28",
        "status": "em_andamento"
      }
    ]
  }]
}
```

#### Escalar Equipe Completa para uma OS
```bash
curl -X POST http://localhost:3000/api/atendimentos/equipe \
  -H "Content-Type: application/json" \
  -d '{
    "ordemServicoId": 1,
    "tecnicoIds": [1, 2, 3, 4],
    "status": "pendente",
    "observacoes": "Equipe completa escalada"
  }'
```

**Resposta:**
```json
{
  "sucesso": 3,
  "total": 4,
  "atendimentos": [
    {
      "atendimento": { ... },
      "conflitos": [ ... ] // Se houver
    }
  ],
  "avisos": [
    {
      "tecnicoId": 2,
      "tecnico": "Maria",
      "tipo": "duplicado",
      "mensagem": "Técnico já está vinculado a esta OS"
    }
  ]
}
```

## 🚀 Como Usar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do PostgreSQL e secret para JWT:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/siberius?schema=public"
JWT_SECRET="sua_chave_secreta_super_segura_aqui"
```

**Importante:** A variável `JWT_SECRET` é obrigatória para o sistema de autenticação funcionar.

### 3. Executar migrações do Prisma

```bash
npm run prisma:migrate
```

### 4. Configurar o sistema

Edite o arquivo `config.conf` com suas preferências:

```conf
# Diretório raiz onde os arquivos PDF estão localizados
# O sistema irá escanear recursivamente todas as subpastas
PDF_DIRECTORY=C:\orcamentos\empresa2025

# Intervalo de verificação em minutos (padrão: 5 minutos)
CHECK_INTERVAL_MINUTES=5

# Habilitar logs detalhados (true/false)
VERBOSE_LOGGING=true
```

**Nota:** O sistema irá escanear **todas as subpastas** dentro do diretório especificado automaticamente.

### 5. Iniciar o sistema

**Modo desenvolvimento (com hot-reload):**
```bash
npm run dev
```

**Modo produção:**
```bash
npm run build
npm start
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia em modo desenvolvimento com hot-reload
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Inicia a aplicação compilada
- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:migrate` - Executa migrações do banco de dados
- `npm run prisma:studio` - Abre interface visual do Prisma Studio

## 📦 Tecnologias

- **Node.js** com **TypeScript**
- **Prisma ORM** - Gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados relacional
- **tsx** - Execução TypeScript com hot-reload

## ⚙️ Configurações

O sistema lê as configurações do arquivo `config.conf`:

- `PDF_DIRECTORY`: Diretório raiz onde os PDFs estão localizados (será escaneado recursivamente)
- `CHECK_INTERVAL_MINUTES`: Intervalo entre verificações (em minutos)
- `VERBOSE_LOGGING`: Habilita logs detalhados (true/false)

## 🔄 Fluxo de Funcionamento

1. Sistema inicia e conecta ao banco de dados
2. Lê configurações do arquivo `config.conf`
3. **Escaneia recursivamente** o diretório especificado e todas as subpastas em busca de arquivos PDF
4. Para cada PDF encontrado:
   - Faz parse do nome do arquivo
   - Verifica se já foi indexado (por caminho completo)
   - **Se contém "O.S ATUALIZADA":**
     - Busca versões anteriores com mesmo número
     - Desativa versões anteriores (`ativa=false`)
     - Cria nova versão incrementada
     - Mantém link com versão original
   - **Se não contém "O.S ATUALIZADA":**
     - Se número já existe: pula arquivo e loga aviso
     - Se número é novo: cria versão 1
   - Salva informações no banco de dados incluindo caminho relativo
5. Aguarda o intervalo configurado e repete o processo

## 📝 Logs

O sistema fornece logs detalhados sobre:
- Quantidade de arquivos encontrados e tempo de escaneamento
- Caminho de cada arquivo indexado
- Arquivos já indexados (pulados)
- Erros de parse ou indexação
- Erros de acesso a pastas/arquivos individuais
- Status da conexão com banco de dados

## 🛡️ Tratamento de Erros

- **Arquivos com formato inválido** são reportados mas não interrompem o processo
- **Arquivos duplicados** são identificados e pulados
- **Erros de acesso** a pastas/arquivos individuais são logados mas não param a varredura
- **Erros de permissão** são tratados graciosamente
- **Erros de conexão** são logados e tratados adequadamente

## � Consultas Úteis

### Buscar apenas OSs ativas (versões mais recentes)
```sql
SELECT * FROM ordens_servico 
WHERE ativa = true 
ORDER BY numero_os;
```

### Ver histórico completo de uma OS
```sql
SELECT 
  numero_os, versao, os_atualizada, data, nome_arquivo, ativa, indexado_em
FROM ordens_servico 
WHERE numero_os = '12345' 
ORDER BY versao;
```

### Listar OSs que tiveram atualizações
```sql
SELECT numero_os, COUNT(*) as total_versoes 
FROM ordens_servico 
GROUP BY numero_os 
HAVING COUNT(*) > 1
ORDER BY total_versoes DESC;
```

### Buscar versão original de uma OS atualizada
```sql
SELECT original.* 
FROM ordens_servico AS atual
INNER JOIN ordens_servico AS original ON atual.os_original_id = original.id
WHERE atual.id = 123;
```

### Listar todas as versões inativas (substituídas)
```sql
SELECT numero_os, versao, nome_arquivo, indexado_em
FROM ordens_servico 
WHERE ativa = false
ORDER BY numero_os, versao;
```

### Ver equipe alocada em uma OS
```sql
SELECT 
  t.nome as tecnico,
  t.especialidade,
  a.status,
  a.data_atribuicao,
  a.observacoes
FROM atendimentos_os a
INNER JOIN tecnicos t ON a.tecnico_id = t.id
WHERE a.ordem_servico_id = 1
ORDER BY a.data_atribuicao;
```

### Verificar agenda de um técnico em período
```sql
SELECT 
  os.numero_os,
  os.nome_cliente,
  os.nome_evento,
  os.data,
  a.status,
  a.observacoes
FROM atendimentos_os a
INNER JOIN ordens_servico os ON a.ordem_servico_id = os.id
WHERE a.tecnico_id = 1
  AND os.data BETWEEN '2025-12-01' AND '2025-12-31'
  AND a.status IN ('pendente', 'em_andamento')
ORDER BY os.data;
```

### Encontrar técnicos disponíveis em uma data
```sql
SELECT 
  t.id,
  t.nome,
  t.especialidade,
  COUNT(a.id) as atendimentos_no_dia
FROM tecnicos t
LEFT JOIN atendimentos_os a ON t.id = a.tecnico_id
LEFT JOIN ordens_servico os ON a.ordem_servico_id = os.id 
  AND DATE(os.data) = '2025-12-28'
  AND a.status IN ('pendente', 'em_andamento')
WHERE t.ativo = true
GROUP BY t.id, t.nome, t.especialidade
HAVING COUNT(a.id) < 3  -- Técnicos com menos de 3 atendimentos
ORDER BY atendimentos_no_dia;
```

### Relatório de carga de trabalho por técnico
```sql
SELECT 
  t.nome,
  t.especialidade,
  COUNT(DISTINCT a.ordem_servico_id) as total_os,
  COUNT(CASE WHEN a.status = 'pendente' THEN 1 END) as pendentes,
  COUNT(CASE WHEN a.status = 'em_andamento' THEN 1 END) as em_andamento,
  COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as concluidos
FROM tecnicos t
LEFT JOIN atendimentos_os a ON t.id = a.tecnico_id
WHERE t.ativo = true
GROUP BY t.id, t.nome, t.especialidade
ORDER BY total_os DESC;
```

## �📄 Licença

MIT
