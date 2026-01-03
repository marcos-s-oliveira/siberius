import os from 'os';

/**
 * Obtém o IP local do servidor
 * Útil para gerar QR Codes com a URL correta para dispositivos móveis
 */
export function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  
  // Procurar por interface de rede ativa com IP IPv4 não-localhost
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;
    
    for (const address of iface) {
      // Pular endereços internos e não-IPv4
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  
  // Fallback para localhost se não encontrar IP
  return 'localhost';
}

/**
 * Constrói a URL base do servidor
 * Usa variáveis de ambiente ou detecta automaticamente
 */
export function getServerBaseUrl(): string {
  const port = process.env.API_PORT || '3000';
  
  // Se SERVER_HOST está definido, usar ele
  if (process.env.SERVER_HOST) {
    return `http://${process.env.SERVER_HOST}:${port}`;
  }
  
  // Caso contrário, detectar IP automaticamente
  const ip = getLocalIpAddress();
  return `http://${ip}:${port}`;
}
