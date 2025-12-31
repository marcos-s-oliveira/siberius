import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export class AtendimentoController {
  /**
   * Listar todos os atendimentos com informações da OS e técnicos
   */
  async list(req: Request, res: Response) {
    try {
      const { status, tecnicoId } = req.query;
      
      const atendimentos = await prisma.atendimento.findMany({
        where: {
          ...(status && { status: status as string }),
          ...(tecnicoId && {
            tecnicos: {
              some: {
                tecnicoId: parseInt(tecnicoId as string)
              }
            }
          })
        },
        include: {
          ordemServico: true,
          tecnicos: {
            include: {
              tecnico: true
            }
          }
        },
        orderBy: {
          dataAgendamento: 'desc'
        }
      });

      res.json(atendimentos);
    } catch (error) {
      console.error('Erro ao listar atendimentos:', error);
      res.status(500).json({ error: 'Erro ao listar atendimentos' });
    }
  }

  /**
   * Buscar atendimento por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const atendimento = await prisma.atendimento.findUnique({
        where: { id: parseInt(id) },
        include: {
          ordemServico: true,
          tecnicos: {
            include: {
              tecnico: true
            }
          }
        }
      });

      if (!atendimento) {
        return res.status(404).json({ error: 'Atendimento não encontrado' });
      }

      res.json(atendimento);
    } catch (error) {
      console.error('Erro ao buscar atendimento:', error);
      res.status(500).json({ error: 'Erro ao buscar atendimento' });
    }
  }

  /**
   * Buscar atendimento por OS
   */
  async getByOS(req: Request, res: Response) {
    try {
      const { osId } = req.params;

      const atendimento = await prisma.atendimento.findUnique({
        where: { ordemServicoId: parseInt(osId) },
        include: {
          ordemServico: true,
          tecnicos: {
            include: {
              tecnico: true
            }
          }
        }
      });

      if (!atendimento) {
        return res.status(404).json({ error: 'Atendimento não encontrado para esta OS' });
      }

      res.json(atendimento);
    } catch (error) {
      console.error('Erro ao buscar atendimento por OS:', error);
      res.status(500).json({ error: 'Erro ao buscar atendimento' });
    }
  }

  /**
   * Criar atendimento com equipe de técnicos
   */
  async create(req: Request, res: Response) {
    try {
      const { ordemServicoId, dataAgendamento, tecnicos, observacoes } = req.body;

      // Validações
      if (!ordemServicoId) {
        return res.status(400).json({ error: 'ID da ordem de serviço é obrigatório' });
      }

      if (!dataAgendamento) {
        return res.status(400).json({ error: 'Data de agendamento é obrigatória' });
      }

      if (!tecnicos || !Array.isArray(tecnicos) || tecnicos.length === 0) {
        return res.status(400).json({ error: 'Pelo menos um técnico deve ser atribuído' });
      }

      // Verificar se OS existe
      const os = await prisma.ordemServico.findUnique({
        where: { id: ordemServicoId }
      });

      if (!os) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }

      // Verificar se já existe atendimento para esta OS
      const atendimentoExistente = await prisma.atendimento.findUnique({
        where: { ordemServicoId }
      });

      if (atendimentoExistente) {
        return res.status(400).json({ error: 'Já existe um atendimento para esta OS' });
      }

      // Criar atendimento com equipe
      const atendimento = await prisma.atendimento.create({
        data: {
          ordemServicoId,
          dataAgendamento: new Date(dataAgendamento),
          status: 'agendado',
          observacoes,
          tecnicos: {
            create: tecnicos.map((t: any) => ({
              tecnicoId: t.tecnicoId,
              funcao: t.funcao || null
            }))
          }
        },
        include: {
          ordemServico: true,
          tecnicos: {
            include: {
              tecnico: true
            }
          }
        }
      });

      res.status(201).json(atendimento);
    } catch (error) {
      console.error('Erro ao criar atendimento:', error);
      res.status(500).json({ error: 'Erro ao criar atendimento' });
    }
  }

  /**
   * Atualizar atendimento
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { dataAgendamento, status, observacoes } = req.body;

      const atendimento = await prisma.atendimento.update({
        where: { id: parseInt(id) },
        data: {
          ...(dataAgendamento && { dataAgendamento: new Date(dataAgendamento) }),
          ...(status && { status }),
          ...(observacoes !== undefined && { observacoes })
        },
        include: {
          ordemServico: true,
          tecnicos: {
            include: {
              tecnico: true
            }
          }
        }
      });

      res.json(atendimento);
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error);
      res.status(500).json({ error: 'Erro ao atualizar atendimento' });
    }
  }

  /**
   * Atualizar status do atendimento
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }

      const validStatuses = ['nao_agendado', 'agendado', 'em_andamento', 'concluido', 'cancelado'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      const atendimento = await prisma.atendimento.update({
        where: { id: parseInt(id) },
        data: { status },
        include: {
          ordemServico: true,
          tecnicos: {
            include: {
              tecnico: true
            }
          }
        }
      });

      res.json(atendimento);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }

  /**
   * Adicionar técnico ao atendimento
   */
  async addTecnico(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tecnicoId, funcao } = req.body;

      if (!tecnicoId) {
        return res.status(400).json({ error: 'ID do técnico é obrigatório' });
      }

      // Verificar se técnico já está no atendimento
      const existente = await prisma.tecnicoAtendimento.findUnique({
        where: {
          atendimentoId_tecnicoId: {
            atendimentoId: parseInt(id),
            tecnicoId: parseInt(tecnicoId)
          }
        }
      });

      if (existente) {
        return res.status(400).json({ error: 'Técnico já está neste atendimento' });
      }

      await prisma.tecnicoAtendimento.create({
        data: {
          atendimentoId: parseInt(id),
          tecnicoId: parseInt(tecnicoId),
          funcao: funcao || null
        }
      });

      // Retornar atendimento atualizado
      const atendimento = await prisma.atendimento.findUnique({
        where: { id: parseInt(id) },
        include: {
          ordemServico: true,
          tecnicos: {
            include: {
              tecnico: true
            }
          }
        }
      });

      res.json(atendimento);
    } catch (error) {
      console.error('Erro ao adicionar técnico:', error);
      res.status(500).json({ error: 'Erro ao adicionar técnico' });
    }
  }

  /**
   * Remover técnico do atendimento
   */
  async removeTecnico(req: Request, res: Response) {
    try {
      const { id, tecnicoId } = req.params;

      // Verificar se é o último técnico
      const count = await prisma.tecnicoAtendimento.count({
        where: { atendimentoId: parseInt(id) }
      });

      if (count <= 1) {
        return res.status(400).json({ error: 'Não é possível remover o último técnico do atendimento' });
      }

      await prisma.tecnicoAtendimento.delete({
        where: {
          atendimentoId_tecnicoId: {
            atendimentoId: parseInt(id),
            tecnicoId: parseInt(tecnicoId)
          }
        }
      });

      // Retornar atendimento atualizado
      const atendimento = await prisma.atendimento.findUnique({
        where: { id: parseInt(id) },
        include: {
          ordemServico: true,
          tecnicos: {
            include: {
              tecnico: true
            }
          }
        }
      });

      res.json(atendimento);
    } catch (error) {
      console.error('Erro ao remover técnico:', error);
      res.status(500).json({ error: 'Erro ao remover técnico' });
    }
  }

  /**
   * Deletar atendimento
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.atendimento.delete({
        where: { id: parseInt(id) }
      });

      res.json({ message: 'Atendimento deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar atendimento:', error);
      res.status(500).json({ error: 'Erro ao deletar atendimento' });
    }
  }

  /**
   * Estatísticas de atendimentos
   */
  async stats(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate || endDate) {
        where.dataAgendamento = {};
        if (startDate) where.dataAgendamento.gte = new Date(startDate as string);
        if (endDate) where.dataAgendamento.lte = new Date(endDate as string);
      }

      const [total, porStatus, tecnicosMaisAtivos] = await Promise.all([
        // Total de atendimentos
        prisma.atendimento.count({ where }),
        
        // Contagem por status
        prisma.atendimento.groupBy({
          by: ['status'],
          where,
          _count: true
        }),
        
        // Técnicos mais ativos
        prisma.tecnicoAtendimento.groupBy({
          by: ['tecnicoId'],
          where: startDate || endDate ? {
            atendimento: {
              dataAgendamento: where.dataAgendamento
            }
          } : undefined,
          _count: true,
          orderBy: {
            _count: {
              tecnicoId: 'desc'
            }
          },
          take: 10
        })
      ]);

      // Buscar nomes dos técnicos
      const tecnicosIds = tecnicosMaisAtivos.map(t => t.tecnicoId);
      const tecnicos = await prisma.tecnico.findMany({
        where: { id: { in: tecnicosIds } }
      });

      const tecnicosComNomes = tecnicosMaisAtivos.map(t => ({
        tecnicoId: t.tecnicoId,
        nome: tecnicos.find(tec => tec.id === t.tecnicoId)?.nome || 'Desconhecido',
        totalAtendimentos: t._count
      }));

      res.json({
        total,
        porStatus: porStatus.map(s => ({
          status: s.status,
          total: s._count
        })),
        tecnicosMaisAtivos: tecnicosComNomes
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}
