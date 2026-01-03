import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OrdemServicoController {
  // GET - Listar todas as ordens de serviço
  static async list(req: Request, res: Response) {
    try {
      const ordensServico = await prisma.ordemServico.findMany({
        include: {
          atendimento: {
            include: {
              tecnicos: {
                include: {
                  tecnico: true
                }
              }
            }
          }
        },
        orderBy: { indexadoEm: 'desc' }
      });
      res.json(ordensServico);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar ordens de serviço', details: error });
    }
  }

  // GET - Buscar ordem de serviço por ID
  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ordemServico = await prisma.ordemServico.findUnique({
        where: { id: parseInt(id) },
        include: {
          atendimento: {
            include: {
              tecnicos: {
                include: {
                  tecnico: true
                }
              }
            }
          }
        }
      });
      
      if (!ordemServico) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }
      
      res.json(ordemServico);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar ordem de serviço', details: error });
    }
  }

  // GET - Buscar ordens de serviço por número (pode haver múltiplas versões)
  static async getByNumero(req: Request, res: Response) {
    try {
      const { numero } = req.params;
      
      // Remover zeros à esquerda para busca
      const numeroNormalizado = numero.replace(/^0+/, '') || '0';
      
      const ordensServico = await prisma.ordemServico.findMany({
        where: { 
          numeroOS: {
            // Buscar pelo número sem zeros à esquerda OU com zeros à esquerda
            in: [numeroNormalizado, numero]
          }
        },
        include: {
          atendimento: {
            include: {
              tecnicos: {
                include: {
                  tecnico: true
                }
              }
            }
          }
        },
        orderBy: { versao: 'desc' }
      });
      
      if (!ordensServico || ordensServico.length === 0) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }
      
      res.json(ordensServico);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar ordem de serviço', details: error });
    }
  }

  // POST - Criar nova ordem de serviço
  static async create(req: Request, res: Response) {
    try {
      const { 
        numeroOS, 
        nomeCliente, 
        nomeEvento, 
        data, 
        osAtualizada, 
        caminhoArquivo, 
        nomeArquivo 
      } = req.body;
      
      if (!numeroOS || !nomeCliente || !nomeEvento || !data || !caminhoArquivo || !nomeArquivo) {
        return res.status(400).json({ 
          error: 'NumeroOS, nomeCliente, nomeEvento, data, caminhoArquivo e nomeArquivo são obrigatórios' 
        });
      }

      const ordemServico = await prisma.ordemServico.create({
        data: { 
          numeroOS, 
          nomeCliente, 
          nomeEvento, 
          data: new Date(data), 
          osAtualizada: osAtualizada || false, 
          caminhoArquivo, 
          nomeArquivo 
        }
      });
      
      res.status(201).json(ordemServico);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Número de OS ou caminho de arquivo já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao criar ordem de serviço', details: error });
    }
  }

  // PUT - Atualizar ordem de serviço
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        numeroOS, 
        nomeCliente, 
        nomeEvento, 
        data,
        dataMontagem,
        horarioMontagem,
        osAtualizada, 
        caminhoArquivo, 
        nomeArquivo,
        ativa
      } = req.body;

      const updateData: any = {};
      if (numeroOS !== undefined) updateData.numeroOS = numeroOS;
      if (nomeCliente !== undefined) updateData.nomeCliente = nomeCliente;
      if (nomeEvento !== undefined) updateData.nomeEvento = nomeEvento;
      if (data !== undefined) updateData.data = new Date(data);
      if (dataMontagem !== undefined) updateData.dataMontagem = dataMontagem ? new Date(dataMontagem) : null;
      if (horarioMontagem !== undefined) updateData.horarioMontagem = horarioMontagem || null;
      if (osAtualizada !== undefined) updateData.osAtualizada = osAtualizada;
      if (caminhoArquivo !== undefined) updateData.caminhoArquivo = caminhoArquivo;
      if (nomeArquivo !== undefined) updateData.nomeArquivo = nomeArquivo;
      if (ativa !== undefined) updateData.ativa = ativa;

      const ordemServico = await prisma.ordemServico.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      
      res.json(ordemServico);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Número de OS ou caminho de arquivo já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao atualizar ordem de serviço', details: error });
    }
  }

  // DELETE - Remover ordem de serviço
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.ordemServico.delete({
        where: { id: parseInt(id) }
      });
      
      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }
      res.status(500).json({ error: 'Erro ao deletar ordem de serviço', details: error });
    }
  }
}
