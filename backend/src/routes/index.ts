import { Router } from 'express';
import usuarioRoutes from './usuario.routes';
import tecnicoRoutes from './tecnico.routes';
import ordemServicoRoutes from './ordemServico.routes';
import atendimentoRoutes, { setupAtendimentoRoutes } from './atendimento.routes';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import { getApiDocsHTML } from '../docs/apiDocs';
import { SocketManager } from '../socket/SocketManager';

export function setupRoutes(socketManager: SocketManager | null): Router {
  const router = Router();

  // Configurar rotas de atendimento com socket manager
  setupAtendimentoRoutes(socketManager);

  // Documentação interativa na rota raiz
  router.get('/', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.send(getApiDocsHTML(baseUrl));
  });

  // Rotas de autenticação (públicas)
  router.use('/auth', authRoutes);

  // Rotas da API
  router.use('/api', usuarioRoutes);
  router.use('/api', tecnicoRoutes);
  router.use('/api', ordemServicoRoutes);
  router.use('/api', atendimentoRoutes);
  router.use('/api/dashboard', dashboardRoutes);

  // Rota de health check
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Siberius API'
    });
  });

  return router;
}

// Export padrão para compatibilidade
export default function() {
  return setupRoutes(null);
}
