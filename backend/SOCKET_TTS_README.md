# Socket.IO + TTS - Notificações em Tempo Real

## Descrição

Sistema de notificações em tempo real que alerta sobre novas ordens de serviço detectadas pelo indexador de PDFs.

## Como Funciona

### Backend

1. **SocketManager** (`src/socket/SocketManager.ts`)
   - Gerencia conexões WebSocket
   - Emite eventos quando detecta nova OS
   - Suporta múltiplos clientes conectados

2. **ApiServer** (`src/api/ApiServer.ts`)
   - Integra HTTP + Socket.IO no mesmo servidor
   - Inicializa SocketManager automaticamente

3. **PDFIndexer** (`src/indexer/PDFIndexer.ts`)
   - Ao indexar novo arquivo, emite notificação via Socket.IO
   - Inclui: número OS, data, cliente, evento

### Frontend

1. **Socket Service** (`frontend/src/services/socket.ts`)
   - Conecta automaticamente ao backend
   - Reconexão automática em caso de desconexão
   - Gestão de eventos

2. **TTS Service** (`frontend/src/services/tts.ts`)
   - Text-to-Speech usando Web Speech API
   - Voz em português (pt-BR)
   - Mensagem: "Nova ordem de serviço para [data]"

3. **App** (`frontend/src/App.tsx`)
   - Conecta ao Socket.IO quando servidor está online
   - Ouve evento `nova-ordem-servico`
   - Dispara TTS e atualiza calendário

## Evento Socket.IO

**Evento:** `nova-ordem-servico`

**Payload:**
```typescript
{
  numeroOS: string;          // "12432"
  data: Date;                // 2025-12-28T00:00:00Z
  dataFormatted: string;     // "28 de dezembro de 2025"
  cliente: string;           // "Nome do Cliente"
  evento: string;            // "Nome do Evento"
  message: string;           // "Nova ordem de serviço para 28 de dezembro de 2025"
}
```

## Testando

### 1. Iniciar Backend
```bash
cd /d/Dev/siberius
npm run dev:server
```

Você verá:
```
🚀 Servidor API rodando em http://localhost:3000
🔌 Socket.IO ativo e aguardando conexões
```

### 2. Iniciar Frontend
```bash
cd /d/Dev/siberius/frontend
npm run dev
```

### 3. Abrir no Navegador
```
http://localhost:5173
```

No console do navegador você verá:
```
🔌 Conectado ao Socket.IO: [socket-id]
🔊 TTS inicializado
```

### 4. Testar Notificação

Adicione um novo PDF no diretório configurado (`pdfs/` por padrão). O indexador irá:

1. Detectar o novo arquivo
2. Processar e indexar
3. Emitir notificação Socket.IO
4. Frontend receberá e falará via TTS

**Logs no backend:**
```
✨ Novo arquivo indexado: 12432.pdf | OS: 12432
📢 Notificação enviada: Nova OS #12432 para 28 de dezembro de 2025
```

**Logs no frontend (console):**
```
📢 Nova OS recebida: { numeroOS: "12432", ... }
🔊 TTS iniciado: Nova ordem de serviço para 28 de dezembro de 2025
```

## Configurações

### Volume e Velocidade do TTS

Edite `frontend/src/App.tsx`:
```typescript
ttsService.speak(data.message, {
  rate: 1.0,    // Velocidade (0.1 - 10)
  pitch: 1.0,   // Tom (0 - 2)
  volume: 1.0   // Volume (0 - 1)
});
```

### CORS

Edite `.env` no backend:
```
FRONTEND_URL=http://localhost:5173
```

Ou modifique `src/socket/SocketManager.ts`:
```typescript
cors: {
  origin: 'http://seu-frontend.com',
  methods: ['GET', 'POST']
}
```

## Suporte de Navegadores

- ✅ Chrome/Edge (excelente)
- ✅ Firefox (bom)
- ✅ Safari (bom, mas requer interação do usuário primeiro)
- ❌ IE11 (não suportado)

## Troubleshooting

### TTS não funciona
- Verifique se o navegador suporta Web Speech API
- Em alguns navegadores, é necessário interação do usuário primeiro
- Teste no console: `window.speechSynthesis.speak(new SpeechSynthesisUtterance('teste'))`

### Socket não conecta
- Verifique se o backend está rodando
- Confirme a porta no `.env` (padrão: 3000)
- Verifique CORS no backend

### Notificações não aparecem
- Verifique logs do backend (deve mostrar "📢 Notificação enviada")
- Verifique logs do frontend (console do navegador)
- Confirme que o Socket.IO está conectado: `🔌 Conectado ao Socket.IO`
