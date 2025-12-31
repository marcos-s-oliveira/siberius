import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

// Login completo (email + senha) para web/mobile
router.post('/login', AuthController.loginComplete);

// Login rápido com PIN para tela touch
router.post('/login/pin', AuthController.loginPin);

// Listar usuários para seleção (apenas nome e id)
router.get('/usuarios', AuthController.listForSelection);

// Listar todos os usuários (dados completos)
router.get('/usuarios/full', AuthController.listFull);

// Criar novo usuário
router.post('/usuarios', AuthController.create);

// Atualizar usuário
router.put('/usuarios/:id', AuthController.update);

// Deletar usuário
router.delete('/usuarios/:id', AuthController.delete);

// Verificar se token ainda é válido
router.get('/verify', AuthController.verifyToken);

// Renovar token
router.post('/refresh', AuthController.refreshToken);

export default router;
