import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'siberius-secret-key-change-in-production';
const TOKEN_EXPIRATION_FULL = '12h'; // Token completo (email+senha) válido por 12 horas
const TOKEN_EXPIRATION_PIN = '3h'; // Token PIN válido por 3 horas

interface JWTPayload {
  userId: number;
  email: string;
  nome: string;
  authType: 'full' | 'pin'; // Tipo de autenticação
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

      // Gerar token com autenticação completa
      const token = jwt.sign(
        {
          userId: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          authType: 'full'
        } as JWTPayload,
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION_FULL }
      );

      res.json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        },
        authType: 'full',
        expiresIn: TOKEN_EXPIRATION_FULL
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

      // Gerar token PIN com validade de 3 horas
      const token = jwt.sign(
        {
          userId: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          authType: 'pin'
        } as JWTPayload,
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION_PIN }
      );

      res.json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        },
        authType: 'pin',
        expiresIn: TOKEN_EXPIRATION_PIN
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

        // Determinar expiração baseado no tipo de auth original
        const expiresIn = decoded.authType === 'full' ? TOKEN_EXPIRATION_FULL : TOKEN_EXPIRATION_PIN;

        // Gerar novo token
        const newToken = jwt.sign(
          {
            userId: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            authType: decoded.authType
          } as JWTPayload,
          JWT_SECRET,
          { expiresIn }
        );

        res.json({
          token: newToken,
          expiresIn
        });
      } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Erro ao renovar token', details: error });
    }
  }

  // GET - Listar todos os usuários (com dados completos, exceto senha)
  static async listFull(req: Request, res: Response) {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          pin: true,
          ativo: true,
          criadoEm: true,
          atualizadoEm: true
        },
        orderBy: { nome: 'asc' }
      });

      res.json(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  // POST - Criar novo usuário
  static async create(req: Request, res: Response) {
    try {
      const { nome, email, senha, pin, ativo } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      // Verificar se email já existe
      const existingUser = await prisma.usuario.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          pin: pin || null,
          ativo: ativo !== undefined ? ativo : true
        },
        select: {
          id: true,
          nome: true,
          email: true,
          pin: true,
          ativo: true,
          criadoEm: true,
          atualizadoEm: true
        }
      });

      res.status(201).json(usuario);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  // PUT - Atualizar usuário
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { nome, email, senha, pin, ativo } = req.body;

      const updateData: any = {};
      
      if (nome !== undefined) updateData.nome = nome;
      if (email !== undefined) updateData.email = email;
      if (pin !== undefined) updateData.pin = pin || null;
      if (ativo !== undefined) updateData.ativo = ativo;
      
      // Se senha for fornecida, fazer hash
      if (senha) {
        updateData.senha = await bcrypt.hash(senha, 10);
      }

      const usuario = await prisma.usuario.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          nome: true,
          email: true,
          pin: true,
          ativo: true,
          criadoEm: true,
          atualizadoEm: true
        }
      });

      res.json(usuario);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  // DELETE - Deletar usuário
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      await prisma.usuario.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }

  // POST - Autenticação mobile via token do QR Code
  static async loginMobile(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token é obrigatório' });
      }

      // Buscar técnico pelo token mobile
      const tecnico = await prisma.tecnico.findUnique({
        where: { mobileToken: token },
        include: {
          alocacoes: {
            where: {
              atendimento: {
                status: {
                  notIn: ['concluido', 'cancelado']
                }
              }
            },
            take: 1 // Apenas para contar se tem OS pendentes
          }
        }
      });

      if (!tecnico) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      if (!tecnico.ativo) {
        return res.status(403).json({ error: 'Técnico inativo' });
      }

      if (!tecnico.usuarioId) {
        return res.status(400).json({ error: 'Usuário não configurado para este técnico' });
      }

      // Buscar dados do usuário
      const usuario = await prisma.usuario.findUnique({
        where: { id: tecnico.usuarioId },
        select: {
          id: true,
          nome: true,
          email: true,
          ativo: true
        }
      });

      if (!usuario || !usuario.ativo) {
        return res.status(403).json({ error: 'Usuário inválido ou inativo' });
      }

      // Gerar token JWT para o técnico
      const jwtToken = jwt.sign(
        {
          userId: usuario.id,
          tecnicoId: tecnico.id,
          email: usuario.email,
          nome: usuario.nome,
          authType: 'mobile'
        },
        JWT_SECRET,
        { expiresIn: '30d' } // Token mobile válido por 30 dias
      );

      res.json({
        token: jwtToken,
        tecnico: {
          id: tecnico.id,
          nome: tecnico.nome,
          email: tecnico.email,
          telefone: tecnico.telefone,
          especialidade: tecnico.especialidade
        },
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        },
        authType: 'mobile',
        expiresIn: '30d'
      });
    } catch (error) {
      console.error('Erro ao fazer login mobile:', error);
      res.status(500).json({ error: 'Erro ao fazer login mobile', details: error });
    }
  }
}
