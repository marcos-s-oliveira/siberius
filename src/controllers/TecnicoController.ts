import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TecnicoController {
  // GET - Listar todos os técnicos
  static async list(req: Request, res: Response) {
    try {
      const tecnicos = await prisma.tecnico.findMany({
        include: {
          atendimentos: {
            include: {
              ordemServico: true
            }
          }
        },
        orderBy: { criadoEm: 'desc' }
      });
      res.json(tecnicos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar técnicos', details: error });
    }
  }

  // GET - Buscar técnico por ID
  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tecnico = await prisma.tecnico.findUnique({
        where: { id: parseInt(id) },
        include: {
          atendimentos: {
            include: {
              ordemServico: true
            }
          }
        }
      });
      
      if (!tecnico) {
        return res.status(404).json({ error: 'Técnico não encontrado' });
      }
      
      res.json(tecnico);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar técnico', details: error });
    }
  }

  // POST - Criar novo técnico
  static async create(req: Request, res: Response) {
    try {
      const { nome, email, telefone, especialidade, ativo } = req.body;
      
      if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' });
      }

      const tecnico = await prisma.tecnico.create({
        data: { nome, email, telefone, especialidade, ativo }
      });
      
      res.status(201).json(tecnico);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao criar técnico', details: error });
    }
  }

  // PUT - Atualizar técnico
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, email, telefone, especialidade, ativo } = req.body;

      const tecnico = await prisma.tecnico.update({
        where: { id: parseInt(id) },
        data: { nome, email, telefone, especialidade, ativo }
      });
      
      res.json(tecnico);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Técnico não encontrado' });
      }
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao atualizar técnico', details: error });
    }
  }

  // DELETE - Remover técnico
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.tecnico.delete({
        where: { id: parseInt(id) }
      });
      
      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Técnico não encontrado' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Técnico possui atendimentos vinculados' });
      }
      res.status(500).json({ error: 'Erro ao deletar técnico', details: error });
    }
  }
}
