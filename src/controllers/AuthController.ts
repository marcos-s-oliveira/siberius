import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'siberius-secret-key-change-in-production';
const TOKEN_EXPIRATION = '12h'; // Token válido por 12 horas

interface JWTPayload {
  userId: number;
  email: string;
  nome: string;
}

export class AuthController {
  // POST - Login completo (email + senha) para web/mobile
  static async loginComplete(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      // Buscar usuário por email
      const usuario = await prisma.usuario.findUnique({
        where: { email },
        select: {
          id: true,
          nome: true,
          email: true,
          senha: true,
          ativo: true
        }
      });

      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      if (!usuario.ativo) {
        return res.status(403).json({ error: 'Usuário inativo' });
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token
      const token = jwt.sign(
        {
          userId: usuario.id,
          email: usuario.email,
          nome: usuario.nome
        } as JWTPayload,
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );

      res.json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        },
        expiresIn: TOKEN_EXPIRATION
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao fazer login', details: error });
    }
  }

  // POST - Login rápido com PIN (para tela touch)
  static async loginPin(req: Request, res: Response) {
    try {
      const { usuarioId, pin } = req.body;

      if (!usuarioId || !pin) {
        return res.status(400).json({ error: 'usuarioId e pin são obrigatórios' });
      }

      // Buscar usuário por ID
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(usuarioId) },
        select: {
          id: true,
          nome: true,
          email: true,
          pin: true,
          ativo: true
        }
      });

      if (!usuario) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      if (!usuario.ativo) {
        return res.status(403).json({ error: 'Usuário inativo' });
      }

      if (!usuario.pin) {
        return res.status(400).json({ error: 'PIN não configurado para este usuário' });
      }

      // Verificar PIN (comparação direta - não precisa hash para PINs simples)
      if (usuario.pin !== pin) {
        return res.status(401).json({ error: 'PIN inválido' });
      }

      // Gerar token com validade maior para tela touch
      const token = jwt.sign(
        {
          userId: usuario.id,
          email: usuario.email,
          nome: usuario.nome
        } as JWTPayload,
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );

      res.json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        },
        expiresIn: TOKEN_EXPIRATION
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao fazer login com PIN', details: error });
    }
  }

  // GET - Listar usuários para seleção (apenas id e nome, sem dados sensíveis)
  static async listForSelection(req: Request, res: Response) {
    try {
      const usuarios = await prisma.usuario.findMany({
        where: { ativo: true },
        select: {
          id: true,
          nome: true
        },
        orderBy: { nome: 'asc' }
      });

      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar usuários', details: error });
    }
  }

  // GET - Verificar token válido
  static async verifyToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const token = authHeader.replace('Bearer ', '');

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        
        // Verificar se usuário ainda está ativo
        const usuario = await prisma.usuario.findUnique({
          where: { id: decoded.userId },
          select: { id: true, nome: true, email: true, ativo: true }
        });

        if (!usuario || !usuario.ativo) {
          return res.status(401).json({ error: 'Usuário inválido ou inativo' });
        }

        res.json({
          valid: true,
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
          }
        });
      } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Erro ao verificar token', details: error });
    }
  }

  // POST - Renovar token
  static async refreshToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const token = authHeader.replace('Bearer ', '');

      try {
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as JWTPayload;
        
        // Verificar se usuário ainda está ativo
        const usuario = await prisma.usuario.findUnique({
          where: { id: decoded.userId },
          select: { id: true, nome: true, email: true, ativo: true }
        });

        if (!usuario || !usuario.ativo) {
          return res.status(401).json({ error: 'Usuário inválido ou inativo' });
        }

        // Gerar novo token
        const newToken = jwt.sign(
          {
            userId: usuario.id,
            email: usuario.email,
            nome: usuario.nome
          } as JWTPayload,
          JWT_SECRET,
          { expiresIn: TOKEN_EXPIRATION }
        );

        res.json({
          token: newToken,
          expiresIn: TOKEN_EXPIRATION
        });
      } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Erro ao renovar token', details: error });
    }
  }
}
