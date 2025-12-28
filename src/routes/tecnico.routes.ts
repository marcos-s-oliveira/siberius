import { Router } from 'express';
import { TecnicoController } from '../controllers/TecnicoController';

const router = Router();

router.get('/tecnicos', TecnicoController.list);
router.get('/tecnicos/:id', TecnicoController.get);
router.post('/tecnicos', TecnicoController.create);
router.put('/tecnicos/:id', TecnicoController.update);
router.delete('/tecnicos/:id', TecnicoController.delete);

export default router;
