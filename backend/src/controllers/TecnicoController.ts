import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getServerBaseUrl } from '../utils/network';

const prisma = new PrismaClient();

export class TecnicoController {
  // GET - Listar todos os técnicos
  static async list(req: Request, res: Response) {
    try {
      const tecnicos = await prisma.tecnico.findMany({
        orderBy: { criadoEm: 'desc' }
      });
      res.json(tecnicos);
    } catch (error) {
      console.error('Erro ao listar técnicos:', error);
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
          alocacoes: {
            include: {
              atendimento: {
                include: {
                  ordemServico: true
                }
              }
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

  // POST - Gerar token mobile e criar usuário para técnico
  static async generateMobileToken(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Buscar técnico
      const tecnico = await prisma.tecnico.findUnique({
        where: { id: parseInt(id) }
      });

      if (!tecnico) {
        return res.status(404).json({ error: 'Técnico não encontrado' });
      }

      if (!tecnico.ativo) {
        return res.status(400).json({ error: 'Técnico inativo' });
      }

      // Gerar token único para o técnico
      const mobileToken = crypto.randomBytes(32).toString('hex');
      
      // Gerar senha aleatória para o usuário
      const senhaAleatoria = crypto.randomBytes(16).toString('hex');
      const senhaHash = await bcrypt.hash(senhaAleatoria, 10);

      // Verificar se já existe usuário para este técnico
      let usuario;
      if (tecnico.usuarioId) {
        // Atualizar usuário existente
        usuario = await prisma.usuario.update({
          where: { id: tecnico.usuarioId },
          data: { 
            senha: senhaHash,
            ativo: true
          }
        });
      } else {
        // Criar novo usuário
        usuario = await prisma.usuario.create({
          data: {
            nome: tecnico.nome,
            email: tecnico.email,
            senha: senhaHash,
            ativo: true
          }
        });
      }

      // Atualizar técnico com o token e usuarioId
      await prisma.tecnico.update({
        where: { id: parseInt(id) },
        data: {
          mobileToken,
          usuarioId: usuario.id
        }
      });

      // Obter URL base do servidor (detecta IP automaticamente)
      const serverUrl = getServerBaseUrl();
      console.log('URL do servidor para QR Code:', serverUrl);
      
      // Retornar dados para gerar QR Code (incluindo URL base)
      const qrData = {
        token: mobileToken,
        tecnicoId: tecnico.id,
        usuarioId: usuario.id,
        nome: tecnico.nome,
        serverUrl: serverUrl
      };

      res.json({
        success: true,
        qrData: JSON.stringify(qrData),
        message: 'Token mobile gerado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao gerar token mobile:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email já cadastrado para outro usuário' });
      }
      res.status(500).json({ error: 'Erro ao gerar token mobile', details: error });
    }
  }

  // GET - Obter ordens de serviço do técnico (para mobile)
  static async getMyOrdens(req: Request, res: Response) {
    try {
      const tecnicoId = (req as any).tecnicoId; // Vem do middleware de autenticação
      
      const { status, page = '1', limit = '10', orderBy = 'dataAgendamento', order = 'asc' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Construir filtros
      const where: any = {
        tecnicoId: tecnicoId
      };

      if (status) {
        where.atendimento = {
          status: status as string
        };
      } else {
        // Por padrão, mostrar apenas OS em aberto (não concluídas ou canceladas)
        where.atendimento = {
          status: {
            notIn: ['concluido', 'cancelado']
          }
        };
      }

      // Buscar alocações do técnico
      const [alocacoes, total] = await Promise.all([
        prisma.tecnicoAtendimento.findMany({
          where,
          include: {
            atendimento: {
              include: {
                ordemServico: true
              }
            }
          },
          orderBy: {
            atendimento: {
              [orderBy as string]: order as 'asc' | 'desc'
            }
          },
          skip,
          take: limitNum
        }),
        prisma.tecnicoAtendimento.count({ where })
      ]);

      const ordensFormatadas = alocacoes.map(alocacao => ({
        id: alocacao.id,
        atendimentoId: alocacao.atendimentoId,
        funcao: alocacao.funcao,
        ordemServico: {
          id: alocacao.atendimento.ordemServico.id,
          numeroOS: alocacao.atendimento.ordemServico.numeroOS,
          nomeCliente: alocacao.atendimento.ordemServico.nomeCliente,
          nomeEvento: alocacao.atendimento.ordemServico.nomeEvento,
          data: alocacao.atendimento.ordemServico.data,
          dataMontagem: alocacao.atendimento.ordemServico.dataMontagem,
          horarioMontagem: alocacao.atendimento.ordemServico.horarioMontagem
        },
        atendimento: {
          id: alocacao.atendimento.id,
          dataAgendamento: alocacao.atendimento.dataAgendamento,
          status: alocacao.atendimento.status,
          observacoes: alocacao.atendimento.observacoes
        }
      }));

      res.json({
        data: ordensFormatadas,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar ordens do técnico:', error);
      res.status(500).json({ error: 'Erro ao buscar ordens de serviço', details: error });
    }
  }

  // POST - Aceitar ordem de serviço (mudar status para em_andamento)
  static async acceptOrdem(req: Request, res: Response) {
    try {
      const tecnicoId = (req as any).tecnicoId;
      const { atendimentoId } = req.body;

      if (!atendimentoId) {
        return res.status(400).json({ error: 'atendimentoId é obrigatório' });
      }

      // Verificar se o técnico está alocado neste atendimento
      const alocacao = await prisma.tecnicoAtendimento.findFirst({
        where: {
          atendimentoId: parseInt(atendimentoId),
          tecnicoId: tecnicoId
        }
      });

      if (!alocacao) {
        return res.status(403).json({ error: 'Técnico não está alocado neste atendimento' });
      }

      // Atualizar status do atendimento
      const atendimento = await prisma.atendimento.update({
        where: { id: parseInt(atendimentoId) },
        data: { status: 'em_andamento' }
      });

      res.json({
        success: true,
        atendimento
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Atendimento não encontrado' });
      }
      res.status(500).json({ error: 'Erro ao aceitar ordem', details: error });
    }
  }

  // POST - Finalizar ordem de serviço (mudar status para concluido)
  static async finishOrdem(req: Request, res: Response) {
    try {
      const tecnicoId = (req as any).tecnicoId;
      const { atendimentoId, observacoes } = req.body;

      if (!atendimentoId) {
        return res.status(400).json({ error: 'atendimentoId é obrigatório' });
      }

      // Verificar se o técnico está alocado neste atendimento
      const alocacao = await prisma.tecnicoAtendimento.findFirst({
        where: {
          atendimentoId: parseInt(atendimentoId),
          tecnicoId: tecnicoId
        }
      });

      if (!alocacao) {
        return res.status(403).json({ error: 'Técnico não está alocado neste atendimento' });
      }

      // Buscar atendimento atual
      const atendimentoAtual = await prisma.atendimento.findUnique({
        where: { id: parseInt(atendimentoId) }
      });

      if (!atendimentoAtual) {
        return res.status(404).json({ error: 'Atendimento não encontrado' });
      }

      // Atualizar status do atendimento
      const atendimento = await prisma.atendimento.update({
        where: { id: parseInt(atendimentoId) },
        data: { 
          status: 'concluido',
          observacoes: observacoes || atendimentoAtual.observacoes,
          dataFinalizacao: new Date()
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

      res.json({
        success: true,
        atendimento
      });
    } catch (error: any) {
      console.error('Erro ao finalizar ordem:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Atendimento não encontrado' });
      }
      res.status(500).json({ error: 'Erro ao finalizar ordem', details: error.message || error });
    }
  }

  // GET - Histórico de OS do técnico (concluídas e canceladas)
  static async getHistory(req: Request, res: Response) {
    try {
      const tecnicoId = (req as any).tecnicoId;
      const { page = '1', limit = '10' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where = {
        tecnicoId: tecnicoId,
        atendimento: {
          status: {
            in: ['concluido', 'cancelado']
          }
        }
      };

      const [alocacoes, total] = await Promise.all([
        prisma.tecnicoAtendimento.findMany({
          where,
          include: {
            atendimento: {
              include: {
                ordemServico: true
              }
            }
          },
          orderBy: {
            atendimento: {
              atualizadoEm: 'desc'
            }
          },
          skip,
          take: limitNum
        }),
        prisma.tecnicoAtendimento.count({ where })
      ]);

      const historicoFormatado = alocacoes.map(alocacao => ({
        id: alocacao.id,
        atendimentoId: alocacao.atendimentoId,
        funcao: alocacao.funcao,
        ordemServico: {
          id: alocacao.atendimento.ordemServico.id,
          numeroOS: alocacao.atendimento.ordemServico.numeroOS,
          nomeCliente: alocacao.atendimento.ordemServico.nomeCliente,
          nomeEvento: alocacao.atendimento.ordemServico.nomeEvento,
          data: alocacao.atendimento.ordemServico.data
        },
        atendimento: {
          id: alocacao.atendimento.id,
          dataAgendamento: alocacao.atendimento.dataAgendamento,
          status: alocacao.atendimento.status,
          observacoes: alocacao.atendimento.observacoes,
          finalizadoEm: alocacao.atendimento.atualizadoEm
        }
      }));

      res.json({
        data: historicoFormatado,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({ error: 'Erro ao buscar histórico', details: error });
    }
  }

  // GET - Perfil do técnico
  static async getProfile(req: Request, res: Response) {
    try {
      const tecnicoId = (req as any).tecnicoId;

      const tecnico = await prisma.tecnico.findUnique({
        where: { id: tecnicoId },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          especialidade: true,
          criadoEm: true
        }
      });

      if (!tecnico) {
        return res.status(404).json({ error: 'Técnico não encontrado' });
      }

      // Estatísticas
      const [totalAtendimentos, concluidos, emAndamento] = await Promise.all([
        prisma.tecnicoAtendimento.count({
          where: { tecnicoId }
        }),
        prisma.tecnicoAtendimento.count({
          where: {
            tecnicoId,
            atendimento: { status: 'concluido' }
          }
        }),
        prisma.tecnicoAtendimento.count({
          where: {
            tecnicoId,
            atendimento: { status: 'em_andamento' }
          }
        })
      ]);

      res.json({
        ...tecnico,
        estatisticas: {
          totalAtendimentos,
          concluidos,
          emAndamento
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar perfil', details: error });
    }
  }
}
