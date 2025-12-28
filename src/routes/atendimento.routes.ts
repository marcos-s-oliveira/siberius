import { Router } from 'express';
import { AtendimentoOSController } from '../controllers/AtendimentoOSController';

const router = Router();

router.get('/atendimentos', AtendimentoOSController.list);
router.get('/atendimentos/:id', AtendimentoOSController.get);
router.get('/atendimentos/ordem-servico/:ordemServicoId', AtendimentoOSController.listByOrdemServico);
router.get('/atendimentos/tecnico/:tecnicoId', AtendimentoOSController.listByTecnico);
router.get('/atendimentos/tecnico/:tecnicoId/agenda/:data', AtendimentoOSController.checkAgenda);
router.post('/atendimentos', AtendimentoOSController.create);
router.post('/atendimentos/equipe', AtendimentoOSController.createEquipe);
router.put('/atendimentos/:id', AtendimentoOSController.update);
router.delete('/atendimentos/:id', AtendimentoOSController.delete);

export default router;
