import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Spinner from './Spinner';
import './DashboardHome.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

interface GeneralStats {
  totalOS: number;
  totalTecnicos: number;
  totalAtendimentos: number;
  totalUsuarios: number;
}

interface OSByMonth {
  month: string;
  count: number;
}

interface OSvsAtendimentos {
  totalOS: number;
  totalAtendimentos: number;
  osComAtendimento: number;
  osSemAtendimento: number;
  atendimentosAgendados: number;
  atendimentosEmAndamento: number;
  atendimentosConcluidos: number;
  atendimentosCancelados?: number;
}

interface WeeklyData {
  week: string;
  count: number;
}

interface TecnicoRanking {
  nome: string;
  especialidade: string;
  totalAtendimentos: number;
  agendados: number;
  emAndamento: number;
  concluidos: number;
}

interface TecnicosByEspecialidade {
  especialidade: string;
  count: number;
}

interface UpcomingEvent {
  numeroOS: string;
  nomeCliente: string;
  nomeEvento: string;
  data: string;
}

function DashboardHome() {
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [osByMonth, setOsByMonth] = useState<OSByMonth[]>([]);
  const [osVsAtendimentos, setOsVsAtendimentos] = useState<OSvsAtendimentos | null>(null);
  const [weeklyAverage, setWeeklyAverage] = useState<WeeklyData[]>([]);
  const [tecnicoRanking, setTecnicoRanking] = useState<TecnicoRanking[]>([]);
  const [tecnicosByEspecialidade, setTecnicosByEspecialidade] = useState<TecnicosByEspecialidade[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para o período do ranking
  const [rankingPeriod, setRankingPeriod] = useState<'30days' | 'thisMonth' | 'custom'>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Recarregar apenas o ranking quando o período mudar
    loadTecnicoRanking();
  }, [rankingPeriod, customStartDate, customEndDate]);

  const getRankingDateRange = (): { startDate?: string; endDate?: string } => {
    const today = new Date();
    
    switch (rankingPeriod) {
      case '30days':
        // Últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return {
          startDate: thirtyDaysAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      
      case 'thisMonth':
        // Do dia 1 até hoje
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: firstDay.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      
      case 'custom':
        // Datas personalizadas
        if (customStartDate && customEndDate) {
          return {
            startDate: customStartDate,
            endDate: customEndDate
          };
        }
        return {};
      
      default:
        return {};
    }
  };

  const loadTecnicoRanking = async () => {
    try {
      const { startDate, endDate } = getRankingDateRange();
      const rankingRes = await dashboardAPI.getTecnicoRanking(startDate, endDate);
      setTecnicoRanking(rankingRes.data);
    } catch (error: any) {
      console.error('Erro ao carregar ranking de técnicos:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Carregando dados do dashboard...');
      
      const { startDate, endDate } = getRankingDateRange();
      
      const [
        statsRes,
        osByMonthRes,
        osVsAtendimentosRes,
        weeklyRes,
        rankingRes,
        especialidadeRes,
        upcomingRes
      ] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getOSByMonth(),
        dashboardAPI.getOSvsAtendimentos(),
        dashboardAPI.getWeeklyAverage(),
        dashboardAPI.getTecnicoRanking(startDate, endDate),
        dashboardAPI.getTecnicosByEspecialidade(),
        dashboardAPI.getUpcomingEvents()
      ]);

      console.log('Dados carregados com sucesso');
      
      setStats(statsRes.data);
      setOsByMonth(osByMonthRes.data);
      setOsVsAtendimentos(osVsAtendimentosRes.data);
      setWeeklyAverage(weeklyRes.data);
      setTecnicoRanking(rankingRes.data);
      setTecnicosByEspecialidade(especialidadeRes.data);
      setUpcomingEvents(upcomingRes.data);
    } catch (error: any) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError(error?.response?.data?.error || error?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-home-loading">
        <Spinner size="large" message="Carregando dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-home-error">
        <h2>Erro ao carregar dashboard</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData} className="btn-retry">Tentar novamente</button>
      </div>
    );
  }

  const atendimentosData = osVsAtendimentos ? [
    { name: 'Agendados', value: osVsAtendimentos.atendimentosAgendados },
    { name: 'Em Andamento', value: osVsAtendimentos.atendimentosEmAndamento },
    { name: 'Concluídos', value: osVsAtendimentos.atendimentosConcluidos },
    ...(osVsAtendimentos.atendimentosCancelados ? [{ name: 'Cancelados', value: osVsAtendimentos.atendimentosCancelados }] : [])
  ] : [];

  const osCobertura = osVsAtendimentos ? [
    { name: 'Com Atendimento', value: osVsAtendimentos.osComAtendimento },
    { name: 'Sem Atendimento', value: osVsAtendimentos.osSemAtendimento }
  ] : [];

  return (
    <div className="dashboard-home">
      <h1 className="dashboard-title">Dashboard - Visão Geral</h1>

      {/* Cards de Estatísticas Gerais */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Ordens de Serviço</h3>
            <p className="stat-value">{stats?.totalOS || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍🔧</div>
          <div className="stat-content">
            <h3>Técnicos Ativos</h3>
            <p className="stat-value">{stats?.totalTecnicos || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Atendimentos</h3>
            <p className="stat-value">{stats?.totalAtendimentos || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Usuários</h3>
            <p className="stat-value">{stats?.totalUsuarios || 0}</p>
          </div>
        </div>
      </div>

      {/* Linha 1: Gráficos principais */}
      <div className="charts-row">
        <div className="chart-container">
          <h3>Ordens de Serviço por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={osByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#667eea" name="OS" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Média Semanal de Eventos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyAverage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#764ba2" strokeWidth={2} name="Eventos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Linha 2: Status de Atendimentos */}
      <div className="charts-row">
        <div className="chart-container">
          <h3>Status dos Atendimentos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={atendimentosData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {atendimentosData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Cobertura de Atendimentos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={osCobertura}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {osCobertura.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index + 3]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Linha 3: Técnicos */}
      <div className="charts-row">
        <div className="chart-container">
          <h3>Técnicos por Especialidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tecnicosByEspecialidade} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="especialidade" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#43e97b" name="Técnicos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="ranking-header">
            <h3>Ranking de Atendimentos por Técnico</h3>
            <div className="period-selector">
              <select 
                value={rankingPeriod} 
                onChange={(e) => setRankingPeriod(e.target.value as '30days' | 'thisMonth' | 'custom')}
              >
                <option value="30days">Últimos 30 dias</option>
                <option value="thisMonth">Este mês</option>
                <option value="custom">Personalizado</option>
              </select>
              
              {rankingPeriod === 'custom' && (
                <div className="custom-date-inputs">
                  <input 
                    type="date" 
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={customEndDate || new Date().toISOString().split('T')[0]}
                  />
                  <span>até</span>
                  <input 
                    type="date" 
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="ranking-list">
            {tecnicoRanking.slice(0, 10).map((tecnico, index) => (
              <div key={index} className="ranking-item">
                <div className="ranking-position">{index + 1}º</div>
                <div className="ranking-info">
                  <div className="ranking-name">{tecnico.nome}</div>
                  <div className="ranking-especialidade">{tecnico.especialidade}</div>
                </div>
                <div className="ranking-stats">
                  <span className="stat-badge total">{tecnico.totalAtendimentos}</span>
                  <span className="stat-badge concluidos">{tecnico.concluidos} ✓</span>
                  <span className="stat-badge andamento">{tecnico.emAndamento} ⏳</span>
                  <span className="stat-badge agendados">{tecnico.agendados} 📅</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Eventos Próximos */}
      {upcomingEvents.length > 0 && (
        <div className="upcoming-events">
          <h3>📅 Eventos nos Próximos 7 Dias</h3>
          <div className="events-list">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="event-card">
                <div className="event-date">
                  {new Date(event.data).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </div>
                <div className="event-info">
                  <div className="event-os">OS #{event.numeroOS}</div>
                  <div className="event-name">{event.nomeEvento}</div>
                  <div className="event-client">{event.nomeCliente}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardHome;
