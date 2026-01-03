# Guia: QR Code com URL Dinâmica

## 📱 Funcionalidade

O sistema agora passa a URL base do servidor através do QR Code para o aplicativo mobile. Isso torna o aplicativo muito mais flexível e elimina a necessidade de configurar manualmente a URL no código.

## 🎯 Benefícios

- **Configuração Automática**: O aplicativo mobile configura automaticamente a URL do servidor ao escanear o QR Code
- **Flexibilidade**: Funciona com qualquer servidor sem precisar recompilar o app
- **Múltiplos Servidores**: Um mesmo aplicativo pode conectar a diferentes servidores (desenvolvimento, homologação, produção)
- **Zero Configuração Manual**: Técnicos não precisam saber o IP do servidor

## 🔄 Como Funciona

### 1. Geração do QR Code (Backend)

Quando um administrador gera um QR Code para um técnico no sistema web:

```typescript
// O backend detecta automaticamente o IP local da máquina
// e gera o QR Code com a URL correta:
{
  "token": "abc123...",
  "tecnicoId": 5,
  "usuarioId": 10,
  "nome": "João Silva",
  "serverUrl": "http://192.168.1.100:3000"  // ← Detectado automaticamente!
}
```

**Detecção Automática de IP**: O sistema usa a função `getServerBaseUrl()` que:
- Detecta automaticamente o IP local da máquina
- Usa a variável `SERVER_HOST` se definida no `.env`
- Fallback para `localhost` se não encontrar IP

### 2. Leitura do QR Code (Mobile)

Quando o técnico escaneia o QR Code no aplicativo mobile:

1. **Extração dos Dados**:
   - Token de autenticação
   - Dados do técnico
   - **URL do servidor**

2. **Salvamento Local**:
   - A URL é salva no `SecureStore` do dispositivo
   - Fica disponível para todas as próximas requisições

3. **Configuração Automática**:
   - A URL base da API é atualizada dinamicamente
   - Todas as requisições subsequentes usam essa URL

### 3. Persistência

- A URL é salva localmente no dispositivo
- Permanece após fechar e reabrir o aplicativo
- Só muda quando um novo QR Code é escaneado

## 📝 Arquivos Modificados

### Backend

**`backend/src/utils/network.ts`** (NOVO)
```typescript
// Detecta automaticamente o IP local do servidor
export function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  // Procura por interface IPv4 não-local
  // Retorna o primeiro IP encontrado
}

export function getServerBaseUrl(): string {
  // Usa SERVER_HOST do .env se disponível
  // Caso contrário, detecta IP automaticamente
}
```

**`backend/src/controllers/TecnicoController.ts`**
```typescript
import { getServerBaseUrl } from '../utils/network';

// Incluir a URL base no QR Code
const serverUrl = getServerBaseUrl(); // ← Detecção automática!
console.log('URL do servidor para QR Code:', serverUrl);

const qrData = {
  token: mobileToken,
  tecnicoId: tecnico.id,
  usuarioId: usuario.id,
  nome: tecnico.nome,
  serverUrl: serverUrl  // ← Adicionado
};
```

### Mobile

**`mobile/src/services/api.ts`**
```typescript
// Novas funções
export const saveServerUrl = async (url: string) => {
  await SecureStore.setItemAsync('serverUrl', url);
};

export const getServerUrl = async () => {
  return await SecureStore.getItemAsync('serverUrl');
};

export const updateBaseUrl = (newUrl: string) => {
  api.defaults.baseURL = newUrl;
};
```

**`mobile/src/contexts/AuthContext.tsx`**
```typescript
// Carregar URL ao iniciar
async function loadStorageData() {
  const savedUrl = await getServerUrl();
  if (savedUrl) {
    updateBaseUrl(savedUrl);
  }
  // ... resto do código
}

// Salvar URL ao fazer login
async function signIn(qrToken: string, serverUrl?: string) {
  if (serverUrl) {
    await saveServerUrl(serverUrl);
    updateBaseUrl(serverUrl);
  }
  // ... resto do código
}
```

**`mobile/src/screens/LoginScreen.tsx`**
```typescript
const handleBarCodeScanned = async ({ data }: { data: string }) => {
  const qrData = JSON.parse(data);
  
  // Extrair URL e token
  await signIn(qrData.token, qrData.serverUrl);
};
```

## 🚀 Uso Prático

### Cenário 1: Ambiente de Desenvolvimento
```
QR Code contém: http://192.168.1.100:3000
→ App conecta ao servidor de desenvolvimento
```

### Cenário 2: Ambiente de Produção
```
QR Code contém: https://api.siberius.com.br
→ App conecta ao servidor de produção
```

### Cenário 3: Múltiplos Clientes
```
Cliente A: http://cliente-a.siberius.com:3000
Cliente B: http://cliente-b.siberius.com:3000
→ Mesmo app funciona para ambos
```

## ⚠️ Notas Importantes

### Detecção Automática de IP

O sistema **detecta automaticamente** o IP local do servidor! Você não precisa configurar nada manualmente. 

O sistema procura por:
1. Interface de rede ativa (não-localhost)
2. Endereço IPv4
3. Primeira interface encontrada que atende os critérios

### Configuração Manual (Opcional)

Se você quiser forçar um IP específico, pode definir no `.env`:

```env
# backend/.env
API_PORT=3000
SERVER_HOST=192.168.1.100  # Seu IP específico (opcional)
```

Com `SERVER_HOST` definido, o sistema usará esse valor em vez de detectar automaticamente.

### Como Verificar o IP Detectado

Quando você gera um QR Code, o backend loga no console:
```
URL do servidor para QR Code: http://192.168.1.100:3000
```

Verifique os logs do backend para confirmar o IP correto.

### Segurança

- Use HTTPS em produção
- Considere adicionar validação da URL
- Não exponha servidores de desenvolvimento na internet

### Compatibilidade

- Funciona com QR Codes antigos (sem URL) - mantém comportamento anterior
- QR Codes novos incluem a URL automaticamente
- Apps já instalados continuam funcionando normalmente

## 🔧 Melhorias Futuras Sugeridas

1. **Validação da URL**: Verificar se a URL é válida antes de salvar
2. **Tela de Configuração**: Permitir alterar a URL manualmente se necessário
3. **Múltiplos Perfis**: Salvar várias URLs para trocar entre ambientes
4. **Detecção Automática**: Descobrir URL automaticamente via mDNS/Bonjour
5. **Health Check**: Verificar conectividade antes de salvar a URL

## 📱 Experiência do Usuário

### Antes
1. Técnico baixa o app
2. Administrador precisa informar o IP do servidor
3. Técnico precisa configurar manualmente no código ou em alguma tela
4. Erro frequente de conexão se IP estiver errado

### Agora
1. Técnico baixa o app
2. Escaneia o QR Code
3. ✅ Pronto! App configurado automaticamente

## 🐛 Troubleshooting

### App não conecta após escanear QR Code

1. Verifique se o servidor está rodando
2. Verifique se o dispositivo está na mesma rede
3. Teste a URL manualmente no navegador do celular
4. Verifique firewall/antivírus bloqueando a porta

### Limpar configuração salva

Para debug, você pode limpar os dados salvos:

```typescript
// No código do app (temporário para debug)
import * as SecureStore from 'expo-secure-store';

await SecureStore.deleteItemAsync('serverUrl');
await SecureStore.deleteItemAsync('authToken');
await SecureStore.deleteItemAsync('tecnicoData');
```

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do app mobile
2. Verifique os logs do backend
3. Certifique-se que ambos estão na mesma versão
4. Verifique conectividade de rede
