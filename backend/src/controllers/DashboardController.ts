import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardController {
  /**
   * Retorna estatísticas gerais do sistema
   */
  static async getGeneralStats(req: Request, res: Response) {
    try {
      const [totalOS, totalTecnicos, totalAtendimentos, totalUsuarios] = await Promise.all([
        prisma.ordemServico.count({ where: { ativa: true } }),
        prisma.tecnico.count({ where: { ativo: true } }),
        prisma.atendimento.count(),
        prisma.usuario.count({ where: { ativo: true } })
      ]);

      res.json({
        totalOS,
        totalTecnicos,
        totalAtendimentos,
        totalUsuarios
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas gerais:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  /**
   * Retorna Ordens de Serviço agrupadas por mês (últimos 12 meses)
   */
  static async getOSByMonth(req: Request, res: Response) {
    try {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const orders = await prisma.ordemServico.findMany({
        where: {
          ativa: true,
          data: {
            gte: twelveMonthsAgo
          }
        },
        select: {
          data: true
        }
      });

      // Agrupar por mês usando chave de ordenação (YYYY-MM)
      const groupedByMonth: Record<string, { month: string; count: number; sortKey: string }> = {};
      
      orders.forEach(order => {
        const date = new Date(order.data);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11
        
        // Chave para ordenação (YYYY-MM)
        const sortKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        // Label de exibição
        const monthLabel = date.toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric' 
        });
        
        if (!groupedByMonth[sortKey]) {
          groupedByMonth[sortKey] = { month: monthLabel, count: 0, sortKey };
        }
        groupedByMonth[sortKey].count++;
      });

      // Converter para array e ordenar por chave (YYYY-MM)
      const result = Object.values(groupedByMonth)
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(({ month, count }) => ({ month, count }));

      res.json(result);
    } catch (error) {
      console.error('Erro ao buscar OS por mês:', error);
      res.status(500).json({ error: 'Erro ao buscar dados' });
    }
  }

  /**
   * Retorna comparação entre OS e Atendimentos
   */
  static async getOSvsAtendimentos(req: Request, res: Response) {
    try {
      const [totalOS, totalAtendimentos, atendimentosAgendados, atendimentosEmAndamento, atendimentosConcluidos, atendimentosCancelados] = await Promise.all([
        prisma.ordemServico.count({ where: { ativa: true } }),
        prisma.atendimento.count(),
        prisma.atendimento.count({ where: { status: 'agendado' } }),
        prisma.atendimento.count({ where: { status: 'em_andamento' } }),
        prisma.atendimento.count({ where: { status: 'concluido' } }),
        prisma.atendimento.count({ where: { status: 'cancelado' } })
      ]);

      res.json({
        totalOS,
        totalAtendimentos,
        osComAtendimento: totalAtendimentos,
        osSemAtendimento: totalOS - totalAtendimentos,
        atendimentosAgendados,
        atendimentosEmAndamento,
        atendimentosConcluidos,
        atendimentosCancelados
      });
    } catch (error) {
      console.error('Erro ao buscar OS vs Atendimentos:', error);
      res.status(500).json({ error: 'Erro ao buscar dados' });
    }
  }

  /**
   * Retorna média semanal de eventos (últimas 8 semanas)
   */
  static async getWeeklyAverage(req: Request, res: Response) {
    try {
      const eightWeeksAgo = new Date();
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56); // 8 semanas

      const orders = await prisma.ordemServico.findMany({
        where: {
          ativa: true,
          data: {
            gte: eightWeeksAgo
          }
        },
        select: {
          data: true
        }
      });

      // Agrupar por semana
      const weeklyData: Record<string, number> = {};
      
      orders.forEach(order => {
        const date = new Date(order.data);
        const weekNumber = getWeekNumber(date);
        const year = date.getFullYear();
        const weekKey = `Sem ${weekNumber}/${year}`;
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
      });

      const result = Object.entries(weeklyData)
        .map(([week, count]) => ({ week, count }))
        .slice(-8); // Últimas 8 semanas

      res.json(result);
    } catch (error) {
      console.error('Erro ao buscar média semanal:', error);
      res.status(500).json({ error: 'Erro ao buscar dados' });
    }
  }

  /**
   * Retorna ranking de atendimentos por técnico
   * Aceita query params: startDate e endDate (ISO format)
   * Padrão: últimos 30 dias se não especificado
   */
  static async getTecnicoRanking(req: Request, res: Response) {
    try {
      // Obter parâmetros de data da query
      const { startDate, endDate } = req.query;
      
      // Definir período padrão: últimos 30 dias
      let start: Date;
      let end: Date = new Date();
      
      if (startDate && endDate) {
        // Usar datas fornecidas
        start = new Date(startDate as string);
        end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999); // Incluir o dia inteiro
      } else {
        // Padrão: últimos 30 dias
        start = new Date();
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
      }

      const tecnicos = await prisma.tecnico.findMany({
        where: { ativo: true },
        include: {
          alocacoes: {
            where: {
              atendimento: {
                dataAgendamento: {
                  gte: start,
                  lte: end
                }
              }
            },
            include: {
              atendimento: {
                select: {
                  status: true
                }
              }
            }
          }
        }
      });

      const ranking = tecnicos.map(tecnico => ({
        nome: tecnico.nome,
        especialidade: tecnico.especialidade || 'Não especificada',
        totalAtendimentos: tecnico.alocacoes.length,
        agendados: tecnico.alocacoes.filter(a => a.atendimento.status === 'agendado').length,
        emAndamento: tecnico.alocacoes.filter(a => a.atendimento.status === 'em_andamento').length,
        concluidos: tecnico.alocacoes.filter(a => a.atendimento.status === 'concluido').length
      }))
      .sort((a, b) => b.totalAtendimentos - a.totalAtendimentos);

      res.json(ranking);
    } catch (error) {
      console.error('Erro ao buscar ranking de técnicos:', error);
      res.status(500).json({ error: 'Erro ao buscar dados' });
    }
  }

  /**
   * Retorna técnicos agrupados por especialidade
   * Parse de especialidades múltiplas separadas por vírgula
   */
  static async getTecnicosByEspecialidade(req: Request, res: Response) {
    try {
      const tecnicos = await prisma.tecnico.findMany({
        where: { ativo: true },
        select: {
          especialidade: true
        }
      });

      const groupedByEspecialidade: Record<string, number> = {};
      
      tecnicos.forEach(tecnico => {
        const especialidadeStr = tecnico.especialidade || 'Não especificada';
        
        // Separar especialidades múltiplas por vírgula
        const especialidades = especialidadeStr
          .split(',')
          .map(e => e.trim())
          .filter(e => e.length > 0);
        
        // Contar cada especialidade separadamente
        especialidades.forEach(especialidade => {
          groupedByEspecialidade[especialidade] = (groupedByEspecialidade[especialidade] || 0) + 1;
        });
      });

      const result = Object.entries(groupedByEspecialidade)
        .map(([especialidade, count]) => ({ especialidade, count }))
        .sort((a, b) => b.count - a.count);

      res.json(result);
    } catch (error) {
      console.error('Erro ao buscar técnicos por especialidade:', error);
      res.status(500).json({ error: 'Erro ao buscar dados' });
    }
  }

  /**
   * Retorna eventos nos próximos 7 dias
   */
  static async getUpcomingEvents(req: Request, res: Response) {
    try {
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);

      const upcomingOS = await prisma.ordemServico.findMany({
        where: {
          ativa: true,
          data: {
            gte: today,
            lte: sevenDaysLater
          }
        },
        select: {
          numeroOS: true,
          nomeCliente: true,
          nomeEvento: true,
          data: true
        },
        orderBy: {
          data: 'asc'
        }
      });

      res.json(upcomingOS);
    } catch (error) {
      console.error('Erro ao buscar eventos próximos:', error);
      res.status(500).json({ error: 'Erro ao buscar dados' });
    }
  }
}

// Função auxiliar para calcular número da semana
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
