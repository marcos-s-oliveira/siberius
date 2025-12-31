import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { requireFullAuth } from '../middleware/auth';

const router = Router();

// Todas as rotas do dashboard exigem autenticação completa (não aceita PIN)
router.get('/stats', requireFullAuth, DashboardController.getGeneralStats);
router.get('/os-by-month', requireFullAuth, DashboardController.getOSByMonth);
router.get('/os-vs-atendimentos', requireFullAuth, DashboardController.getOSvsAtendimentos);
router.get('/weekly-average', requireFullAuth, DashboardController.getWeeklyAverage);
router.get('/tecnico-ranking', requireFullAuth, DashboardController.getTecnicoRanking);
router.get('/tecnicos-by-especialidade', requireFullAuth, DashboardController.getTecnicosByEspecialidade);
router.get('/upcoming-events', requireFullAuth, DashboardController.getUpcomingEvents);

export default router;
