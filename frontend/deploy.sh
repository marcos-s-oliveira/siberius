#!/bin/bash
# Script de Deploy do Frontend Siberius

echo "🚀 Deploy Frontend Siberius"
echo "============================"
echo ""

# Build
echo "📦 Fazendo build..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Erro no build!"
  exit 1
fi

echo "✅ Build concluído!"
echo ""

# Pedir IP do backend
read -p "🌐 Digite o IP/domínio do backend (ex: 192.168.1.100): " BACKEND_IP
read -p "🔌 Digite a porta do backend [3000]: " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-3000}

# Atualizar config.js
echo "⚙️  Configurando dist/config.js..."
cat > dist/config.js << EOF
// Configuração do Frontend Siberius
// Este arquivo pode ser editado diretamente em produção

window.SIBERIUS_CONFIG = {
  // URL do Backend API
  API_URL: 'http://${BACKEND_IP}:${BACKEND_PORT}',
  
  // Timeout para requisições (em milissegundos)
  API_TIMEOUT: 10000,
  
  // Configurações opcionais
  DEBUG: false
};
EOF

echo "✅ Configuração atualizada!"
echo ""
echo "📋 Configuração aplicada:"
echo "   API_URL: http://${BACKEND_IP}:${BACKEND_PORT}"
echo ""

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
  echo "⚠️  PM2 não encontrado. Instale com: npm install -g pm2"
  echo ""
  echo "💡 Para servir manualmente:"
  echo "   npm install -g serve"
  echo "   serve -s dist -p 5173"
  exit 0
fi

# PM2
read -p "🚀 Iniciar com PM2? (s/n): " START_PM2

if [ "$START_PM2" = "s" ] || [ "$START_PM2" = "S" ]; then
  echo "🔄 Reiniciando PM2..."
  pm2 delete siberius-frontend 2>/dev/null || true
  pm2 start serve --name siberius-frontend -- -s dist -p 5173
  pm2 save
  
  echo ""
  echo "✅ Deploy concluído!"
  echo ""
  echo "📡 Acesse em:"
  echo "   Local:  http://localhost:5173"
  echo "   Rede:   http://${BACKEND_IP}:5173"
  echo ""
  echo "📊 Status: pm2 status"
  echo "📋 Logs:   pm2 logs siberius-frontend"
else
  echo ""
  echo "✅ Build pronto!"
  echo ""
  echo "💡 Para servir:"
  echo "   npm install -g serve"
  echo "   serve -s dist -p 5173"
fi
