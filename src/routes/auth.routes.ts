import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

// Login completo (email + senha) para web/mobile
router.post('/login', AuthController.loginComplete);

// Login rápido com PIN para tela touch
router.post('/login/pin', AuthController.loginPin);

// Listar usuários para seleção (apenas nome e id)
router.get('/usuarios', AuthController.listForSelection);

// Verificar se token ainda é válido
router.get('/verify', AuthController.verifyToken);

// Renovar token
router.post('/refresh', AuthController.refreshToken);

export default router;
