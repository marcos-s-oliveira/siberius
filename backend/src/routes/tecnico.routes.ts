import { Router } from 'express';
import { TecnicoController } from '../controllers/TecnicoController';
import { mobileAuthMiddleware } from '../middleware/auth';

const router = Router();

// Rotas administrativas (web)
router.get('/tecnicos', TecnicoController.list);
router.get('/tecnicos/:id', TecnicoController.get);
router.post('/tecnicos', TecnicoController.create);
router.put('/tecnicos/:id', TecnicoController.update);
router.delete('/tecnicos/:id', TecnicoController.delete);
router.post('/tecnicos/:id/generate-token', TecnicoController.generateMobileToken);

// Rotas mobile (requerem autenticação mobile)
router.get('/tecnicos/mobile/ordens', mobileAuthMiddleware, TecnicoController.getMyOrdens);
router.post('/tecnicos/mobile/accept', mobileAuthMiddleware, TecnicoController.acceptOrdem);
router.post('/tecnicos/mobile/finish', mobileAuthMiddleware, TecnicoController.finishOrdem);
router.get('/tecnicos/mobile/history', mobileAuthMiddleware, TecnicoController.getHistory);
router.get('/tecnicos/mobile/profile', mobileAuthMiddleware, TecnicoController.getProfile);

export default router;
