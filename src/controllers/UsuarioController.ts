import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export class UsuarioController {
  // GET - Listar todos os usuários
  static async list(req: Request, res: Response) {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          ativo: true,
          criadoEm: true,
          atualizadoEm: true
          // Não retornar senha e pin por segurança
        },
        orderBy: { criadoEm: 'desc' }
      });
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar usuários', details: error });
    }
  }

  // GET - Buscar usuário por ID
  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar usuário', details: error });
    }
  }

  // POST - Criar novo usuário
  static async create(req: Request, res: Response) {
    try {
      const { nome, email, senha, pin, ativo } = req.body;
      
      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

      const usuario = await prisma.usuario.create({
        data: { 
          nome, 
          email, 
          senha: senhaHash, 
          pin: pin || null,
          ativo 
        },
        select: {
          id: true,
          nome: true,
          email: true,
          ativo: true,
          criadoEm: true
        }
      });
      
      res.status(201).json(usuario);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao criar usuário', details: error });
    }
  }

  // PUT - Atualizar usuário
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, email, senha, ativo } = req.body;

      const usuario = await prisma.usuario.update({
        where: { id: parseInt(id) },
        data: { nome, email, senha, ativo }
      });
      
      res.json(usuario);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao atualizar usuário', details: error });
    }
  }

  // DELETE - Remover usuário
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.usuario.delete({
        where: { id: parseInt(id) }
      });
      
      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.status(500).json({ error: 'Erro ao deletar usuário', details: error });
    }
  }
}
