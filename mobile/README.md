# Siberius Mobile - App Técnico

Aplicativo mobile para técnicos da Siberius acompanharem suas ordens de serviço.

## Funcionalidades

- 📱 **Login via QR Code**: Escaneie o QR code gerado no sistema web
- 📋 **Minhas OS em Aberto**: Visualize ordens de serviço pendentes
- ✅ **Aceitar OS**: Aceite ordens de serviço agendadas
- ✓ **Finalizar OS**: Marque ordens como concluídas
- 📚 **Histórico**: Visualize o histórico de OS finalizadas
- 👤 **Perfil**: Veja suas informações e estatísticas

## Instalação

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo Go instalado no dispositivo móvel (Android/iOS)

### Configuração

1. Instale as dependências:
```bash
cd mobile
npm install
```

2. Configure a URL da API:

Edite o arquivo `src/services/api.ts` e altere a constante `API_BASE_URL` para o endereço IP do seu servidor backend:

```typescript
const API_BASE_URL = 'http://SEU_IP_AQUI:5000';
```

**Importante**: Use o IP da rede local (exemplo: `192.168.1.100`) e não `localhost` ou `127.0.0.1`, pois o dispositivo móvel precisa acessar o servidor na rede.

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

4. Escaneie o QR code exibido no terminal com o aplicativo Expo Go

## Como Usar

### Primeiro Acesso

1. Abra o aplicativo no dispositivo móvel
2. Toque no botão "Ler QR Code"
3. Permita o acesso à câmera quando solicitado
4. No sistema web, vá até a lista de técnicos
5. Clique no botão 📱 do técnico desejado
6. Escaneie o QR code exibido na tela
7. Pronto! Você está autenticado

### Gerenciar Ordens de Serviço

#### Minhas OS em Aberto
- Visualize todas as suas OS pendentes
- Ordene e filtre as OS
- Puxe para baixo para atualizar

#### Aceitar uma OS
1. Na lista de OS abertas, encontre uma OS com status "Agendado"
2. Toque no botão "✓ Aceitar"
3. Confirme a ação

#### Finalizar uma OS
1. Na lista de OS abertas, encontre uma OS com status "Em Andamento"
2. Toque no botão "✓ Finalizar"
3. Confirme a ação

#### Histórico
- Visualize todas as OS que você já finalizou
- Veja informações detalhadas e observações

#### Perfil
- Veja suas informações pessoais
- Acompanhe suas estatísticas:
  - Total de OS
  - OS Concluídas
  - OS em Andamento

## Estrutura do Projeto

```
mobile/
├── src/
│   ├── contexts/          # Contextos React (Auth)
│   ├── navigation/        # Navegação do app
│   ├── screens/          # Telas do aplicativo
│   │   ├── LoginScreen.tsx
│   │   ├── OrdensScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/         # Serviços e API
│   │   ├── api.ts
│   │   └── tecnicoService.ts
│   └── types/            # TypeScript types
│       └── index.ts
├── App.tsx               # Componente principal
├── app.json             # Configuração do Expo
├── package.json         # Dependências
└── tsconfig.json        # Configuração TypeScript
```

## Permissões

O aplicativo solicita as seguintes permissões:

- **Câmera**: Necessária para escanear o QR code no primeiro acesso

## Build de Produção

### Android (APK)

```bash
expo build:android
```

### iOS (IPA)

```bash
expo build:ios
```

### Expo Application Services (EAS)

Para build com EAS:

```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Troubleshooting

### Erro de conexão com o backend

- Verifique se o backend está rodando
- Confirme que o `API_BASE_URL` está correto (use IP da rede local)
- Certifique-se de que o dispositivo móvel está na mesma rede do servidor

### QR Code não é reconhecido

- Verifique a iluminação do ambiente
- Aproxime ou afaste o dispositivo do QR code
- Tente gerar um novo QR code no sistema web

### Aplicativo não carrega após login

- Limpe o cache do app
- Faça logout e login novamente
- Verifique a conexão com a internet

## Tecnologias

- **React Native**: Framework mobile
- **Expo**: Plataforma de desenvolvimento
- **TypeScript**: Linguagem tipada
- **React Navigation**: Navegação entre telas
- **Axios**: Cliente HTTP
- **expo-camera**: Acesso à câmera para QR code
- **expo-secure-store**: Armazenamento seguro de dados

## Suporte

Para problemas ou dúvidas, entre em contato com a equipe de desenvolvimento.

## Licença

MIT
