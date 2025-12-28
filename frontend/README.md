# Siberius Frontend - Touch Screen

Interface touch-screen para visualização de Ordens de Serviço em calendário semanal.

## 📱 Funcionalidades

- ✅ **Calendário Semanal**: Visualização das OS organizadas por dia da semana
- ✅ **Touch-Friendly**: Interface otimizada para telas sensíveis ao toque
- ✅ **Navegação de Semanas**: Avançar/retroceder semanas facilmente
- ✅ **Botão "Hoje"**: Retornar rapidamente à semana atual
- ✅ **Detalhes da OS**: Modal com informações completas ao clicar
- ✅ **Status Visual**: Cores indicam status dos atendimentos
- ✅ **Equipe**: Visualização dos técnicos alocados
- ✅ **Responsivo**: Adapta-se a diferentes tamanhos de tela
- ✅ **Verificação de Conexão**: Valida se o backend está online ao iniciar
- ✅ **Tratamento de Erros**: Telas elegantes para erros 404, 403, 500, timeout, etc.
- ✅ **Retry Automático**: Botão para tentar reconectar ao servidor

## 🎨 Código de Cores

- 🟠 **Laranja**: OS sem atendimentos (pendente alocação)
- 🔵 **Azul**: OS com atendimentos em andamento
- 🟢 **Verde**: OS com atendimentos concluídos

## 🚀 Tecnologias

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Axios** - HTTP Client
- **CSS Modules** - Styling

## 📦 Instalação

```bash
cd frontend
npm install
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto frontend:

```bash
cp .env.example .env
```

Configure a URL do backend:

```env
VITE_API_URL=http://localhost:3000
```

**Nota:** Em produção, altere para a URL real do seu servidor backend.

### Conectando ao Backend

O frontend se conecta ao backend através da variável `VITE_API_URL`. 

Ao iniciar, o sistema:
1. Verifica se o backend está online (`GET /health`)
2. Exibe tela de loading durante a verificação
3. Se conectado, carrega o calendário
4. Se offline, exibe tela de erro elegante com opção de retry

## 🏃 Executar

### Desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:5173

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

## 📂 Estrutura

```
frontend/
├── src/
│   ├── components/
│   │   ├── WeeklyCalendar.tsx    # Componente principal do calendário
│   │   ├── WeeklyCalendar.css    # Estilos do calendário
│   │   ├── ErrorScreen.tsx       # Tela de erros elegante
│   │   ├── ErrorScreen.css       # Estilos da tela de erro
│   │   ├── LoadingScreen.tsx     # Tela de loading
│   │   └── LoadingScreen.css     # Estilos do loading
│   ├── services/
│   │   └── api.ts                # Configuração da API e interceptors
│   ├── types/
│   │   └── index.ts              # Tipos TypeScript
│   ├── App.tsx                   # Componente raiz
│   ├── App.css                   # Estilos globais do app
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Reset CSS
├── .env.example                  # Exemplo de variáveis de ambiente
├── .env                          # Configuração local (não versionado)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 🔌 Integração com Backend

O frontend consome a API REST do backend:

- `GET /health` - Verifica se o servidor está online
- `GET /api/ordens-servico` - Lista todas as OS
- `GET /api/ordens-servico/:id` - Detalhes de uma OS
- `GET /api/atendimentos/ordem-servico/:id` - Atendimentos de uma OS

### Tratamento de Erros

O sistema intercepta e trata todos os erros HTTP de forma elegante:

| Código | Descrição | Mensagem ao Usuário |
|--------|-----------|---------------------|
| **Offline** | Backend não responde | "Não foi possível conectar ao servidor" |
| **Timeout** | Tempo esgotado | "O servidor está demorando para responder" |
| **400** | Bad Request | "Requisição inválida" |
| **401** | Unauthorized | "Não autorizado. Faça login novamente" |
| **403** | Forbidden | "Acesso negado" |
| **404** | Not Found | "Recurso não encontrado" |
| **500** | Server Error | "Erro interno do servidor" |
| **503** | Unavailable | "Serviço temporariamente indisponível" |

## 🎯 Próximas Features

- [ ] Autenticação com PIN
- [ ] Filtros por status
- [ ] Busca de OS
- [ ] Drag & drop para reagendar
- [ ] Notificações em tempo real
- [ ] Modo offline

## 📱 Uso em Tablet/Touch Screen

Para melhor experiência em dispositivos touch:

1. Configure o navegador em modo fullscreen (F11)
2. Desabilite gestos do sistema operacional
3. Use em resolução mínima de 1024x768
4. Recomendado: telas 10" ou maiores

## 🐛 Debug

Logs do console mostram:
- Carregamento das OS
- Erros de API
- Seleções de OS

Abra DevTools (F12) para acompanhar.

## 📄 Licença

MIT
