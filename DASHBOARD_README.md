# Dashboard com Gráficos e Estatísticas

## 🎨 Implementado

### Backend (API)
- ✅ **DashboardController.ts** - 7 endpoints de estatísticas
- ✅ **dashboard.routes.ts** - Rotas configuradas em `/api/dashboard`
- ✅ Integrado ao sistema de rotas principal

### Frontend (React)
- ✅ **DashboardHome.tsx** - Componente principal com gráficos
- ✅ **DashboardHome.css** - Estilização responsiva
- ✅ **Dashboard.tsx** - Atualizado com menu "Home"

## 📊 Estatísticas Disponíveis

1. **Cards Resumo**
   - Total de Ordens de Serviço
   - Técnicos Ativos
   - Total de Atendimentos
   - Usuários Cadastrados

2. **Ordens de Serviço por Mês**
   - Gráfico de barras
   - Últimos 12 meses

3. **Média Semanal de Eventos**
   - Gráfico de linha
   - Últimas 8 semanas

4. **Status dos Atendimentos**
   - Gráfico de pizza
   - Pendentes, Em Andamento, Concluídos

5. **Cobertura de Atendimentos**
   - Gráfico de pizza
   - OS com/sem atendimento

6. **Técnicos por Especialidade**
   - Gráfico de barras horizontal
   - Agrupado por especialidade

7. **Ranking de Atendimentos**
   - Lista ordenada por performance
   - Top 10 técnicos
   - Badges com status dos atendimentos

8. **Eventos Próximos**
   - Cards de eventos nos próximos 7 dias
   - Data, cliente e nome do evento

## 🚀 Como Usar

### 1. Instalar Dependências

**Frontend:**
```bash
cd frontend
npm install
```

Isso instalará o `recharts` (biblioteca de gráficos).

### 2. Iniciar Servidores

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 3. Acessar Dashboard

1. Abra o navegador em `http://localhost:5173`
2. Faça login no sistema
3. Clique em "Dashboard"
4. Selecione "🏠 Home" no menu lateral

## 🎯 Endpoints da API

Base URL: `http://localhost:3001/api/dashboard`

- `GET /stats` - Estatísticas gerais
- `GET /os-by-month` - OS por mês (últimos 12 meses)
- `GET /os-vs-atendimentos` - Comparação OS x Atendimentos
- `GET /weekly-average` - Média semanal (últimas 8 semanas)
- `GET /tecnico-ranking` - Ranking de técnicos
- `GET /tecnicos-by-especialidade` - Técnicos por especialidade
- `GET /upcoming-events` - Eventos próximos (7 dias)

## 📱 Responsivo

O dashboard se adapta automaticamente a diferentes tamanhos de tela:
- Desktop: 2 colunas de gráficos
- Tablet: 1 coluna
- Mobile: Layout otimizado para touch

## 🎨 Cores e Temas

Gradiente principal: `#667eea` → `#764ba2` (roxo)

Badges de status:
- 🔵 Total: `#667eea`
- 🟢 Concluídos: `#43e97b`
- 🟣 Em Andamento: `#f093fb`
- 🔴 Pendentes: `#fa709a`

## 🔄 Atualização de Dados

Os dados são carregados automaticamente ao abrir a página Home do dashboard. Para atualizar, basta navegar para outra página e voltar, ou recarregar a página.

## 📝 Próximas Melhorias Sugeridas

- [ ] Botão de refresh automático
- [ ] Filtros por período
- [ ] Export para PDF/Excel
- [ ] Gráfico de linha do tempo de atendimentos
- [ ] Mapa de calor de eventos por dia da semana
- [ ] Notificações de eventos próximos
