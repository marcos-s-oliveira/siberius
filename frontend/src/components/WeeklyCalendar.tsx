import { useState, useEffect } from 'react';
import { ordensServicoAPI } from '../services/api';
import type { OrdemServico } from '../types';
import Spinner from './Spinner';
import { withMinDelay } from '../utils/delay';
import './WeeklyCalendar.css';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface WeeklyCalendarProps {
  onSelectOS?: (os: OrdemServico) => void;
  refreshTrigger?: number;
}

export default function WeeklyCalendar({ onSelectOS, refreshTrigger }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getWeekDates = (date: Date): Date[] => {
    const week: Date[] = [];
    const current = new Date(date);
    const firstDay = current.getDate() - current.getDay();
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(current);
      day.setDate(firstDay + i);
      day.setHours(0, 0, 0, 0);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  useEffect(() => {
    console.log('🔄 WeeklyCalendar: useEffect triggered - refreshTrigger:', refreshTrigger);
    loadOrdensServico();
  }, [currentWeek, refreshTrigger]);

  const loadOrdensServico = async () => {
    try {
      console.log('📥 Carregando ordens de serviço...');
      setLoading(true);
      setError(null);
      const response = await withMinDelay(
        ordensServicoAPI.getAll(),
        800 // 800ms mínimo para animações
      );
      console.log('✅ Ordens carregadas:', response.data.length, 'total');
      const ativos = response.data.filter(os => os.ativa);
      console.log('✅ Ordens ativas:', ativos.length);
      setOrdensServico(ativos);
    } catch (err: any) {
      console.error('Erro ao carregar ordens de serviço:', err);
      setError(err.userMessage || 'Erro ao carregar as ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  const getOSForDate = (date: Date): OrdemServico[] => {
    return ordensServico.filter(os => {
      const osDate = new Date(os.data);
      osDate.setHours(0, 0, 0, 0);
      return osDate.getTime() === date.getTime();
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const formatMonthYear = (): string => {
    const firstDay = weekDates[0];
    const lastDay = weekDates[6];
    
    if (firstDay.getMonth() === lastDay.getMonth()) {
      return firstDay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    } else {
      return `${firstDay.toLocaleDateString('pt-BR', { month: 'short' })} - ${lastDay.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`;
    }
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const getStatusColor = (os: OrdemServico): string => {
    if (!os.atendimentos || os.atendimentos.length === 0) return '#ff9800';
    
    const hasCompleted = os.atendimentos.some(a => a.status === 'concluido');
    const hasInProgress = os.atendimentos.some(a => a.status === 'em_andamento');
    
    if (hasCompleted) return '#4caf50';
    if (hasInProgress) return '#2196f3';
    return '#ff9800';
  };

  return (
    <div className="weekly-calendar">
      <div className="calendar-header">
        <button className="nav-button" onClick={goToPreviousWeek}>
          ◀ Anterior
        </button>
        <div className="header-center">
          <h2>{formatMonthYear()}</h2>
          <button className="today-button" onClick={goToToday}>
            Hoje
          </button>
        </div>
        <button className="nav-button" onClick={goToNextWeek}>
          Próxima ▶
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <Spinner size="large" message="Carregando ordens de serviço..." />
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button className="retry-button" onClick={loadOrdensServico}>
            🔄 Tentar Novamente
          </button>
        </div>
      ) : (
        <div className="calendar-grid">
          {weekDates.map((date, index) => {
            const osForDay = getOSForDate(date);
            const today = isToday(date);
            
            return (
              <div key={index} className={`day-column ${today ? 'today' : ''}`}>
                <div className="day-header">
                  <div className="day-name">{DAYS_OF_WEEK[index]}</div>
                  <div className="day-date">{formatDate(date)}</div>
                </div>
                
                <div className="os-list">
                  {osForDay.length === 0 ? (
                    <div className="no-os">Sem agendamentos</div>
                  ) : (
                    osForDay.map(os => (
                      <div
                        key={os.id}
                        className="os-card"
                        style={{ borderLeftColor: getStatusColor(os) }}
                        onClick={() => onSelectOS?.(os)}
                      >
                        <div className="os-number">OS #{os.numeroOS}</div>
                        <div className="os-client">{os.nomeCliente}</div>
                        <div className="os-event">{os.nomeEvento}</div>
                        {os.atendimentos && os.atendimentos.length > 0 && (
                          <div className="os-team">
                            👥 {os.atendimentos.length} técnico(s)
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
