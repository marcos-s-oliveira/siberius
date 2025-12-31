import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AtendimentoOSController {
  // GET - Listar todos os atendimentos
  static async list(req: Request, res: Response) {
    try {
      const atendimentos = await prisma.atendimentoOS.findMany({
        include: {
          ordemServico: true,
          tecnico: true
        },
        orderBy: { criadoEm: 'desc' }
      });
      res.json(atendimentos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar atendimentos', details: error });
    }
  }

  // GET - Buscar atendimento por ID
  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const atendimento = await prisma.atendimentoOS.findUnique({
        where: { id: parseInt(id) },
        include: {
          ordemServico: true,
          tecnico: true
        }
      });
      
      if (!atendimento) {
        return res.status(404).json({ error: 'Atendimento não encontrado' });
      }
      
      res.json(atendimento);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar atendimento', details: error });
    }
  }

  // GET - Listar atendimentos por ordem de serviço
  static async listByOrdemServico(req: Request, res: Response) {
    try {
      const { ordemServicoId } = req.params;
      const atendimentos = await prisma.atendimentoOS.findMany({
        where: { ordemServicoId: parseInt(ordemServicoId) },
        include: {
          tecnico: true,
          ordemServico: true
        },
        orderBy: { dataAtribuicao: 'desc' }
      });
      
      res.json(atendimentos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar atendimentos da OS', details: error });
    }
  }

  // GET - Listar atendimentos por técnico
  static async listByTecnico(req: Request, res: Response) {
    try {
      const { tecnicoId } = req.params;
      const atendimentos = await prisma.atendimentoOS.findMany({
        where: { tecnicoId: parseInt(tecnicoId) },
        include: {
          ordemServico: true,
          tecnico: true
        },
        orderBy: { dataAtribuicao: 'desc' }
      });
      
      res.json(atendimentos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar atendimentos do técnico', details: error });
    }
  }

  // POST - Criar novo atendimento
  static async create(req: Request, res: Response) {
    try {
      const { ordemServicoId, tecnicoId, status, observacoes } = req.body;
      
      if (!ordemServicoId || !tecnicoId) {
        return res.status(400).json({ error: 'OrdemServicoId e tecnicoId são obrigatórios' });
      }

      // Verificar se ordem de serviço existe e buscar sua data
      const ordemServico = await prisma.ordemServico.findUnique({
        where: { id: ordemServicoId }
      });
      if (!ordemServico) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }

      // Verificar se técnico existe e está ativo
      const tecnico = await prisma.tecnico.findUnique({
        where: { id: tecnicoId }
      });
      if (!tecnico) {
        return res.status(404).json({ error: 'Técnico não encontrado' });
      }
      if (!tecnico.ativo) {
        return res.status(400).json({ error: 'Técnico está inativo' });
      }

      // Verificar se técnico já está alocado em outra OS na mesma data
      const dataOS = new Date(ordemServico.data);
      const inicioDia = new Date(dataOS.setHours(0, 0, 0, 0));
      const fimDia = new Date(dataOS.setHours(23, 59, 59, 999));

      const conflitos = await prisma.atendimentoOS.findMany({
        where: {
          tecnicoId: tecnicoId,
          status: {
            in: ['pendente', 'em_andamento'] // Apenas atendimentos ativos
          },
          ordemServico: {
            data: {
              gte: inicioDia,
              lte: fimDia
            }
          }
        },
        include: {
          ordemServico: {
            select: {
              numeroOS: true,
              nomeCliente: true,
              data: true
            }
          }
        }
      });

      // Se houver conflitos, retornar aviso mas permitir criação
      let avisos = [];
      if (conflitos.length > 0) {
        avisos.push({
          tipo: 'conflito_agenda',
          mensagem: `Técnico ${tecnico.nome} já está alocado em ${conflitos.length} OS(s) na mesma data`,
          conflitos: conflitos.map(c => ({
            osNumero: c.ordemServico.numeroOS,
            cliente: c.ordemServico.nomeCliente,
            data: c.ordemServico.data,
            status: c.status
          }))
        });
      }

      // Verificar se já existe atendimento deste técnico para esta OS
      const atendimentoExistente = await prisma.atendimentoOS.findFirst({
        where: {
          ordemServicoId: ordemServicoId,
          tecnicoId: tecnicoId
        }
      });

      if (atendimentoExistente) {
        return res.status(409).json({ 
          error: 'Este técnico já está vinculado a esta ordem de serviço',
          atendimentoId: atendimentoExistente.id
        });
      }

      const atendimento = await prisma.atendimentoOS.create({
        data: { 
          ordemServicoId, 
          tecnicoId, 
          status: status || 'pendente',
          observacoes 
        },
        include: {
          ordemServico: true,
          tecnico: true
        }
      });
      
      res.status(201).json({
        atendimento,
        avisos: avisos.length > 0 ? avisos : undefined
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Ordem de serviço ou técnico não encontrado' });
      }
      res.status(500).json({ error: 'Erro ao criar atendimento', details: error });
    }
  }

  // PUT - Atualizar atendimento
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { ordemServicoId, tecnicoId, status, observacoes } = req.body;

      const updateData: any = {};
      if (ordemServicoId !== undefined) updateData.ordemServicoId = ordemServicoId;
      if (tecnicoId !== undefined) updateData.tecnicoId = tecnicoId;
      if (status !== undefined) updateData.status = status;
      if (observacoes !== undefined) updateData.observacoes = observacoes;

      const atendimento = await prisma.atendimentoOS.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          ordemServico: true,
          tecnico: true
        }
      });
      
      res.json(atendimento);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Atendimento não encontrado' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Ordem de serviço ou técnico não encontrado' });
      }
      res.status(500).json({ error: 'Erro ao atualizar atendimento', details: error });
    }
  }

  // DELETE - Remover atendimento
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.atendimentoOS.delete({
        where: { id: parseInt(id) }
      });
      
      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Atendimento não encontrado' });
      }
      res.status(500).json({ error: 'Erro ao deletar atendimento', details: error });
    }
  }

  // POST - Criar atendimento para múltiplos técnicos (equipe)
  static async createEquipe(req: Request, res: Response) {
    try {
      const { ordemServicoId, tecnicoIds, status, observacoes } = req.body;
      
      if (!ordemServicoId || !tecnicoIds || !Array.isArray(tecnicoIds) || tecnicoIds.length === 0) {
        return res.status(400).json({ 
          error: 'OrdemServicoId e tecnicoIds (array) são obrigatórios' 
        });
      }

      // Verificar se ordem de serviço existe
      const ordemServico = await prisma.ordemServico.findUnique({
        where: { id: ordemServicoId }
      });
      if (!ordemServico) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }

      // Verificar conflitos de agenda para todos os técnicos
      const dataOS = new Date(ordemServico.data);
      const inicioDia = new Date(dataOS.setHours(0, 0, 0, 0));
      const fimDia = new Date(dataOS.setHours(23, 59, 59, 999));

      const resultados = [];
      const avisos = [];

      for (const tecnicoId of tecnicoIds) {
        try {
          // Verificar se técnico existe e está ativo
          const tecnico = await prisma.tecnico.findUnique({
            where: { id: tecnicoId }
          });
          
          if (!tecnico) {
            avisos.push({
              tecnicoId,
              tipo: 'erro',
              mensagem: 'Técnico não encontrado'
            });
            continue;
          }

          if (!tecnico.ativo) {
            avisos.push({
              tecnicoId,
              tecnico: tecnico.nome,
              tipo: 'erro',
              mensagem: 'Técnico está inativo'
            });
            continue;
          }

          // Verificar duplicação
          const atendimentoExistente = await prisma.atendimentoOS.findFirst({
            where: {
              ordemServicoId: ordemServicoId,
              tecnicoId: tecnicoId
            }
          });

          if (atendimentoExistente) {
            avisos.push({
              tecnicoId,
              tecnico: tecnico.nome,
              tipo: 'duplicado',
              mensagem: 'Técnico já está vinculado a esta OS'
            });
            continue;
          }

          // Verificar conflitos de agenda
          const conflitos = await prisma.atendimentoOS.findMany({
            where: {
              tecnicoId: tecnicoId,
              status: { in: ['pendente', 'em_andamento'] },
              ordemServico: {
                data: {
                  gte: inicioDia,
                  lte: fimDia
                }
              }
            },
            include: {
              ordemServico: {
                select: {
                  numeroOS: true,
                  nomeCliente: true,
                  data: true
                }
              }
            }
          });

          // Criar atendimento
          const atendimento = await prisma.atendimentoOS.create({
            data: { 
              ordemServicoId, 
              tecnicoId, 
              status: status || 'pendente',
              observacoes 
            },
            include: {
              ordemServico: true,
              tecnico: true
            }
          });

          resultados.push({
            atendimento,
            conflitos: conflitos.length > 0 ? conflitos.map(c => ({
              osNumero: c.ordemServico.numeroOS,
              cliente: c.ordemServico.nomeCliente,
              data: c.ordemServico.data,
              status: c.status
            })) : undefined
          });

        } catch (error) {
          avisos.push({
            tecnicoId,
            tipo: 'erro',
            mensagem: 'Erro ao criar atendimento',
            erro: error
          });
        }
      }

      res.status(201).json({
        sucesso: resultados.length,
        total: tecnicoIds.length,
        atendimentos: resultados,
        avisos: avisos.length > 0 ? avisos : undefined
      });

    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar atendimentos em equipe', details: error });
    }
  }

  // GET - Verificar agenda do técnico em uma data específica
  static async checkAgenda(req: Request, res: Response) {
    try {
      const { tecnicoId, data } = req.params;
      
      const dataConsulta = new Date(data);
      if (isNaN(dataConsulta.getTime())) {
        return res.status(400).json({ error: 'Data inválida. Use formato YYYY-MM-DD' });
      }

      const inicioDia = new Date(dataConsulta.setHours(0, 0, 0, 0));
      const fimDia = new Date(dataConsulta.setHours(23, 59, 59, 999));

      const atendimentos = await prisma.atendimentoOS.findMany({
        where: {
          tecnicoId: parseInt(tecnicoId),
          ordemServico: {
            data: {
              gte: inicioDia,
              lte: fimDia
            }
          }
        },
        include: {
          ordemServico: {
            select: {
              numeroOS: true,
              nomeCliente: true,
              nomeEvento: true,
              data: true,
              caminhoRelativo: true
            }
          }
        },
        orderBy: {
          ordemServico: {
            data: 'asc'
          }
        }
      });

      const tecnico = await prisma.tecnico.findUnique({
        where: { id: parseInt(tecnicoId) },
        select: { nome: true, email: true, especialidade: true }
      });

      res.json({
        tecnico,
        data: data,
        totalAtendimentos: atendimentos.length,
        atendimentos: atendimentos.map(a => ({
          id: a.id,
          numeroOS: a.ordemServico.numeroOS,
          cliente: a.ordemServico.nomeCliente,
          evento: a.ordemServico.nomeEvento,
          data: a.ordemServico.data,
          status: a.status,
          observacoes: a.observacoes
        }))
      });

    } catch (error) {
      res.status(500).json({ error: 'Erro ao verificar agenda', details: error });
    }
  }
}
