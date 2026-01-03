# Formato do QR Code - Exemplo

## Estrutura de Dados

### Antes (apenas token)
```json
{
  "token": "a7f3e8d9c2b1a5f4e3d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6",
  "tecnicoId": 5,
  "usuarioId": 10,
  "nome": "João Silva"
}
```

### Agora (com URL do servidor)
```json
{
  "token": "a7f3e8d9c2b1a5f4e3d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6",
  "tecnicoId": 5,
  "usuarioId": 10,
  "nome": "João Silva",
  "serverUrl": "http://192.168.1.100:3000"
}
```

## Exemplos de URLs Detectadas

### Desenvolvimento Local (Wi-Fi)
```json
{
  "serverUrl": "http://192.168.1.100:3000"
}
```

### Rede Corporativa
```json
{
  "serverUrl": "http://10.0.0.50:3000"
}
```

### Com SERVER_HOST Configurado
```env
# .env
SERVER_HOST=192.168.1.100
API_PORT=3000
```
```json
{
  "serverUrl": "http://192.168.1.100:3000"
}
```

### Produção (HTTPS)
```env
# .env
SERVER_HOST=api.siberius.com.br
API_PORT=443
```
```json
{
  "serverUrl": "http://api.siberius.com.br:443"
}
```

## Como o Mobile Processa

### 1. Escaneia o QR Code
```typescript
const data = "{'token':'abc...','serverUrl':'http://192.168.1.100:3000',...}";
```

### 2. Parse do JSON
```typescript
const qrData = JSON.parse(data);
// {
//   token: "abc...",
//   serverUrl: "http://192.168.1.100:3000",
//   ...
// }
```

### 3. Valida
```typescript
if (!qrData.token) {
  throw new Error('QR Code inválido');
}

if (!qrData.serverUrl) {
  throw new Error('QR Code não contém URL do servidor');
}
```

### 4. Salva Localmente
```typescript
await saveServerUrl(qrData.serverUrl);
// SecureStore: serverUrl = "http://192.168.1.100:3000"
```

### 5. Configura API
```typescript
updateBaseUrl(qrData.serverUrl);
// axios.defaults.baseURL = "http://192.168.1.100:3000"
```

### 6. Faz Login
```typescript
await signIn(qrData.token, qrData.serverUrl);
// POST http://192.168.1.100:3000/auth/login/mobile
```

## Retrocompatibilidade

### QR Codes Antigos (sem serverUrl)
```json
{
  "token": "abc123...",
  "tecnicoId": 5,
  "usuarioId": 10,
  "nome": "João Silva"
}
```

**Comportamento**: 
- Validação falha: "QR Code não contém URL do servidor"
- Solução: Gerar novo QR Code

**Alternativa para Manter Compatibilidade**:
Se quiser manter compatibilidade com QR Codes antigos, modifique `LoginScreen.tsx`:

```typescript
if (!qrData.serverUrl) {
  // Usar URL padrão em vez de erro
  qrData.serverUrl = 'http://192.168.100.101:3000';
  console.warn('QR Code antigo - usando URL padrão');
}
```

## Tamanho do QR Code

### Dados Aproximados
```
Token: 64 caracteres
URL: ~30 caracteres
Outros: ~50 caracteres
Total: ~144 caracteres
```

### Nível de Correção
- **L (Low)**: 7% de correção - QR Code menor
- **M (Medium)**: 15% de correção - **Recomendado**
- **Q (Quartile)**: 25% de correção
- **H (High)**: 30% de correção - QR Code maior

### Densidade Visual
```
Sem URL: ~110 caracteres → QR Code simples
Com URL: ~145 caracteres → QR Code um pouco mais denso
```

**Impacto**: Mínimo - ainda é facilmente escaneável

## Segurança

### Dados Sensíveis no QR Code
- ✅ **Token**: Sim - é necessário para autenticação
- ✅ **URL**: Sim - é informação pública da rede
- ❌ **Senha**: NÃO está no QR Code
- ❌ **Dados Pessoais**: Apenas nome (não sensível)

### Validade do Token
- Token é único por técnico
- Pode ser regenerado a qualquer momento
- Expira em 30 dias (configurável)

### Proteção da URL
A URL em si não é sensível, mas considere:
- Usar firewall para bloquear acesso externo
- Implementar rate limiting
- Usar HTTPS em produção
- Adicionar autenticação de API key (opcional)

## Debugging

### Ver QR Code Decodificado

**Backend (ao gerar)**:
```typescript
console.log('QR Code data:', JSON.stringify(qrData, null, 2));
```

**Mobile (ao escanear)**:
```typescript
console.log('QR Code escaneado:', data);
console.log('QR Code parsed:', JSON.stringify(qrData, null, 2));
```

### Testar Manualmente

**Criar QR Code de teste**:
```bash
# Instalar qrcode-terminal (Node.js)
npm install -g qrcode-terminal

# Gerar QR Code
qrcode-terminal '{"token":"test123","serverUrl":"http://192.168.1.100:3000","tecnicoId":1,"usuarioId":1,"nome":"Teste"}'
```

**Online**:
1. Acesse: https://www.qr-code-generator.com/
2. Cole o JSON
3. Gere e teste com o app

## Logs Esperados

### Backend (geração)
```
✅ Técnico encontrado: João Silva
🔑 Token gerado: a7f3e8d9...
📡 URL do servidor para QR Code: http://192.168.1.100:3000
✅ QR Code gerado com sucesso
```

### Mobile (escaneamento)
```
📷 QR Code escaneado
🔍 Token: a7f3e8d9...
🌐 URL do servidor: http://192.168.1.100:3000
💾 URL do servidor salva: http://192.168.1.100:3000
🔧 URL base atualizada para: http://192.168.1.100:3000
🔐 Iniciando login...
✅ Login concluído com sucesso
```

### Mobile (próximas inicializações)
```
🚀 App iniciando...
💾 URL do servidor carregada: http://192.168.1.100:3000
🔧 URL base atualizada para: http://192.168.1.100:3000
👤 Carregando dados do técnico...
✅ Técnico autenticado: João Silva
```
