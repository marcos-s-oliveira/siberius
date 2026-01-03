# Guia de Configuração - App Técnico Mobile

## Resumo

Foi implementado um sistema completo para que técnicos possam gerenciar suas ordens de serviço através de um aplicativo mobile React Native.

## O que foi implementado

### Backend

1. **Novos campos na tabela `tecnicos`**:
   - `usuarioId`: Vincula o técnico a um usuário do sistema
   - `mobileToken`: Token único para autenticação via QR Code

2. **Novos endpoints**:
   - `POST /api/tecnicos/:id/generate-token` - Gera token mobile e QR code
   - `POST /auth/login/mobile` - Autentica técnico via token do QR Code
   - `GET /api/tecnicos/mobile/ordens` - Lista OS em aberto do técnico
   - `POST /api/tecnicos/mobile/accept` - Aceita uma OS
   - `POST /api/tecnicos/mobile/finish` - Finaliza uma OS
   - `GET /api/tecnicos/mobile/history` - Histórico de OS
   - `GET /api/tecnicos/mobile/profile` - Perfil e estatísticas

3. **Middleware de autenticação mobile**:
   - Valida tokens JWT específicos para mobile
   - Extrai `tecnicoId` do token

### Frontend Web

1. **Botão na tabela de técnicos** (📱):
   - Gera token mobile único
   - Cria usuário automaticamente
   - Exibe QR Code em modal

2. **Modal de QR Code**:
   - Mostra QR code gerado pela API pública (qrserver.com)
   - Contém dados do técnico e token

### Mobile App

1. **Estrutura completa React Native/Expo**:
   - Navegação com tabs
   - Autenticação via contexto
   - Armazenamento seguro de tokens

2. **Tela de Login**:
   - Scanner de QR Code
   - Permissão de câmera
   - Autenticação automática

3. **Tela "Minhas OS em Aberto"**:
   - Lista paginada de OS
   - Filtros e ordenação
   - Botões de aceitar/finalizar
   - Pull to refresh

4. **Tela "Histórico"**:
   - OS concluídas e canceladas
   - Paginação infinita

5. **Tela "Perfil"**:
   - Informações do técnico
   - Estatísticas de desempenho
   - Botão de logout

## Passos para Ativar

### 1. Rodar Migrations do Backend

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 2. Reiniciar o Backend

```bash
npm run dev:server
# ou
npm start
```

### 3. Instalar Dependências do Mobile

```bash
cd mobile
npm install
```

### 4. Configurar URL da API no Mobile

Edite `mobile/src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://SEU_IP_LOCAL:5000';
```

**Importante**: Use o IP da sua máquina na rede local (ex: `192.168.1.100`), não use `localhost`.

Para descobrir seu IP:
- Windows: `ipconfig` (procure por IPv4)
- Linux/Mac: `ifconfig` ou `ip addr`

### 5. Iniciar o App Mobile

```bash
cd mobile
npm start
```

Isso abrirá o Expo Dev Tools. Escaneie o QR code com:
- **Android**: App Expo Go
- **iOS**: App Expo Go ou câmera nativa

## Testando o Sistema

### 1. Gerar QR Code para um Técnico

1. Acesse o frontend web
2. Vá para a lista de técnicos
3. Clique no botão 📱 ao lado do técnico
4. O sistema irá:
   - Criar um usuário automaticamente
   - Gerar um token único
   - Mostrar o QR Code

### 2. Fazer Login no Mobile

1. Abra o app no celular
2. Toque em "Ler QR Code"
3. Permita o acesso à câmera
4. Escaneie o QR Code da tela web
5. Você será autenticado automaticamente

### 3. Usar o App

#### Ver OS em Aberto
- Veja todas as suas OS pendentes
- Puxe para baixo para atualizar

#### Aceitar uma OS
- Encontre uma OS com status "Agendado"
- Toque em "✓ Aceitar"
- Status muda para "Em Andamento"

#### Finalizar uma OS
- Encontre uma OS com status "Em Andamento"
- Toque em "✓ Finalizar"
- Status muda para "Concluído"

#### Ver Histórico
- Navegue para a aba "Histórico"
- Veja todas as OS finalizadas

#### Ver Perfil
- Navegue para a aba "Perfil"
- Veja suas informações e estatísticas

## Segurança

- Tokens mobile são únicos por técnico
- Armazenamento seguro com expo-secure-store
- Tokens JWT válidos por 30 dias
- Apenas o técnico autenticado pode ver suas próprias OS

## Troubleshooting

### Backend não conecta

- Verifique se o backend está rodando na porta 5000
- Confirme que não há firewall bloqueando

### Mobile não conecta ao backend

- Use o IP da rede local, não `localhost`
- Certifique-se de que celular e PC estão na mesma rede
- Teste abrir `http://SEU_IP:5000/api/ordens-servico` no navegador do celular

### QR Code não funciona

- Verifique a iluminação
- Tente gerar um novo QR code
- Confirme que o técnico está ativo

### App não carrega após login

- Limpe o cache do Expo: `expo start -c`
- Verifique os logs no terminal do Expo
- Confirme que o token foi salvo corretamente

## Próximos Passos (Opcional)

1. **Adicionar imagens aos assets**:
   - Criar ícone do app
   - Criar splash screen

2. **Build de produção**:
   ```bash
   expo build:android
   expo build:ios
   ```

3. **Notificações push**:
   - Notificar técnico quando receber nova OS
   - Lembrete de OS próximas

4. **Modo offline**:
   - Cache local de OS
   - Sincronização quando online

5. **Observações na finalização**:
   - Campo para adicionar observações ao finalizar

## API Reference

### Autenticação

```
POST /auth/login/mobile
Body: { "token": "string" }
Response: { "token": "jwt", "tecnico": {...}, "usuario": {...} }
```

### Ordens de Serviço

```
GET /api/tecnicos/mobile/ordens?page=1&limit=10&status=agendado
Headers: Authorization: Bearer <token>
Response: { "data": [...], "pagination": {...} }

POST /api/tecnicos/mobile/accept
Headers: Authorization: Bearer <token>
Body: { "atendimentoId": number }
Response: { "success": true, "atendimento": {...} }

POST /api/tecnicos/mobile/finish
Headers: Authorization: Bearer <token>
Body: { "atendimentoId": number, "observacoes": "string?" }
Response: { "success": true, "atendimento": {...} }
```

### Histórico

```
GET /api/tecnicos/mobile/history?page=1&limit=10
Headers: Authorization: Bearer <token>
Response: { "data": [...], "pagination": {...} }
```

### Perfil

```
GET /api/tecnicos/mobile/profile
Headers: Authorization: Bearer <token>
Response: { "id": number, "nome": "string", ..., "estatisticas": {...} }
```

## Conclusão

O sistema está completo e pronto para uso. Os técnicos podem agora gerenciar suas ordens de serviço diretamente do celular, melhorando a produtividade e comunicação em campo.

## ⚠️ Importante - Boas Práticas de UI

### Frontend Web

**NUNCA use `alert()`, `confirm()` ou `prompt()` do browser!**

Sempre use os componentes modais customizados:
- `AlertModal` - Para alertas e notificações
- `ConfirmModal` - Para confirmações
- `Modal` - Para conteúdo customizado

Veja o guia completo em: [frontend/UI_GUIDELINES.md](frontend/UI_GUIDELINES.md)

### Mobile App

No React Native, use sempre `Alert.alert()` do próprio React Native, nunca funções do browser (que não existem no mobile).

Exemplo correto:
```typescript
import { Alert } from 'react-native';

Alert.alert(
  'Título',
  'Mensagem',
  [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'OK', onPress: () => console.log('OK') }
  ]
);
```
