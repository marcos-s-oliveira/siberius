// Configuração do Frontend Siberius
// Este arquivo pode ser editado diretamente em produção (dist/config.js)
// após o build sem necessidade de recompilar

window.SIBERIUS_CONFIG = {
  // URL do Backend API
  // Em desenvolvimento: http://localhost:3000
  // Em produção: use o IP do servidor ou domínio
  // Exemplos:
  //   - http://192.168.1.100:3000
  //   - http://servidor.empresa.com:3000
  //   - https://api.siberius.com
  API_URL: 'http://localhost:3000',
  
  // Timeout para requisições (em milissegundos)
  API_TIMEOUT: 10000,
  
  // Configurações opcionais
  DEBUG: false
};
