import express from 'express';
import { AtendimentoController } from '../controllers/AtendimentoController';

const router = express.Router();
const controller = new AtendimentoController();

// Listar todos os atendimentos
router.get('/', (req, res) => controller.list(req, res));

// Estatísticas de atendimentos
router.get('/stats', (req, res) => controller.stats(req, res));

// Buscar atendimento por ID
router.get('/:id', (req, res) => controller.getById(req, res));

// Buscar atendimento por OS
router.get('/os/:osId', (req, res) => controller.getByOS(req, res));

// Criar novo atendimento
router.post('/', (req, res) => controller.create(req, res));

// Atualizar atendimento
router.put('/:id', (req, res) => controller.update(req, res));

// Atualizar status
router.patch('/:id/status', (req, res) => controller.updateStatus(req, res));

// Adicionar técnico
router.post('/:id/tecnicos', (req, res) => controller.addTecnico(req, res));

// Remover técnico
router.delete('/:id/tecnicos/:tecnicoId', (req, res) => controller.removeTecnico(req, res));

// Deletar atendimento
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
