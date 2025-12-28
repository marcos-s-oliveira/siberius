import { Router } from 'express';
import { OrdemServicoController } from '../controllers/OrdemServicoController';

const router = Router();

router.get('/ordens-servico', OrdemServicoController.list);
router.get('/ordens-servico/numero/:numero', OrdemServicoController.getByNumero);
router.get('/ordens-servico/:id', OrdemServicoController.get);
router.post('/ordens-servico', OrdemServicoController.create);
router.put('/ordens-servico/:id', OrdemServicoController.update);
router.delete('/ordens-servico/:id', OrdemServicoController.delete);

export default router;
