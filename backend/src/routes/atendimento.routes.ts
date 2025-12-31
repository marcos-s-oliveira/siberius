import { Router } from 'express';
import { AtendimentoController } from '../controllers/AtendimentoController';

const router = Router();
const controller = new AtendimentoController();

// Rotas principais
router.get('/atendimentos', (req, res) => controller.list(req, res));
router.get('/atendimentos/stats', (req, res) => controller.stats(req, res));
router.get('/atendimentos/:id', (req, res) => controller.getById(req, res));
router.get('/atendimentos/os/:osId', (req, res) => controller.getByOS(req, res));
router.post('/atendimentos', (req, res) => controller.create(req, res));
router.put('/atendimentos/:id', (req, res) => controller.update(req, res));
router.patch('/atendimentos/:id/status', (req, res) => controller.updateStatus(req, res));
router.post('/atendimentos/:id/tecnicos', (req, res) => controller.addTecnico(req, res));
router.delete('/atendimentos/:id/tecnicos/:tecnicoId', (req, res) => controller.removeTecnico(req, res));
router.delete('/atendimentos/:id', (req, res) => controller.delete(req, res));

export default router;
