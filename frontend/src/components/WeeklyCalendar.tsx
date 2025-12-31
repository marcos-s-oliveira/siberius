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
  onRegisterAddOS?: (addOSFunc: (numeroOS: string) => Promise<void>) => void;
}

export default function WeeklyCalendar({ onSelectOS, refreshTrigger, onRegisterAddOS }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para adicionar nova OS sem reload completo
  const addNewOS = async (numeroOS: string) => {
    try {
      console.log('➕ Adicionando nova OS ao calendário:', numeroOS);
      const response = await ordensServicoAPI.getByNumero(numeroOS);
      
      if (response.data && response.data.length > 0) {
        // Pegar a versão ativa
        const novaOS = response.data.find(os => os.ativa) || response.data[0];
        
        // Verificar se já existe no estado (evitar duplicatas)
        setOrdensServico(prev => {
          const exists = prev.some(os => os.id === novaOS.id);
          if (exists) {
            console.log('⚠️ OS já existe no calendário, atualizando:', numeroOS);
            return prev.map(os => os.id === novaOS.id ? novaOS : os);
          }
          console.log('✅ Nova OS adicionada ao calendário:', numeroOS);
          return [...prev, novaOS];
        });
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar OS ao calendário:', error);
    }
  };

  // Registrar função de adicionar OS com o componente pai
  useEffect(() => {
    if (onRegisterAddOS) {
      onRegisterAddOS(addNewOS);
    }
  }, [onRegisterAddOS]);

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
      
      // Log detalhado de cada OS com data
      console.log('📋 Detalhes das OSs ativas:');
      ativos.forEach(os => {
        const osDate = new Date(os.data);
        console.log(`  OS #${os.numeroOS} v${os.versao} - Data: ${osDate.toLocaleDateString('pt-BR')} ${osDate.toLocaleTimeString('pt-BR')} - Cliente: ${os.nomeCliente}`);
      });
      
      // Agrupar por data para ver quantas há em cada dia
      const porData = ativos.reduce((acc, os) => {
        const osDate = new Date(os.data);
        osDate.setHours(0, 0, 0, 0);
        const dateKey = osDate.toLocaleDateString('pt-BR');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(os.numeroOS);
        return acc;
      }, {} as Record<string, string[]>);
      console.log('📊 OSs agrupadas por data:', porData);
      
      setOrdensServico(ativos);
    } catch (err: any) {
      console.error('Erro ao carregar ordens de serviço:', err);
      setError(err.userMessage || 'Erro ao carregar as ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  const getOSForDate = (date: Date): OrdemServico[] => {
    const filtered = ordensServico.filter(os => {
      const osDate = new Date(os.data);
      osDate.setHours(0, 0, 0, 0);
      const matches = osDate.getTime() === date.getTime();
      if (matches) {
        console.log(`📅 OS #${os.numeroOS} (v${os.versao}) matched for ${formatDate(date)}:`, os);
      }
      return matches;
    });
    console.log(`📊 Total OSs for ${formatDate(date)}:`, filtered.length, filtered.map(os => `#${os.numeroOS}v${os.versao}`));
    return filtered;
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
    const osDate = new Date(os.data);
    osDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sem equipe escalada
    if (!os.atendimento) {
      // Vermelho: data passada ou hoje
      if (osDate.getTime() <= today.getTime()) {
        return '#f44336'; // vermelho
      }
      // Laranja: data futura
      return '#ff9800'; // laranja
    }
    
    // Verde: com equipe escalada
    return '#4caf50'; // verde
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
            console.log(`🎨 Renderizando ${formatDate(date)}: ${osForDay.length} OSs`, osForDay.map(os => `#${os.numeroOS}(id:${os.id})`));
            
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
                    <>
                      {console.log(`🔧 Mapeando ${osForDay.length} OSs para ${formatDate(date)}`)}
                      {osForDay.map((os, osIndex) => {
                        console.log(`  ↳ Renderizando OS #${os.numeroOS} (id:${os.id}, index:${osIndex})`);
                        return (
                          <div
                            key={os.id}
                            className="os-card"
                            style={{ borderLeftColor: getStatusColor(os) }}
                            onClick={() => onSelectOS?.(os)}
                          >
                            <div className="os-number">OS #{os.numeroOS}</div>
                            <div className="os-client">{os.nomeCliente}</div>
                            <div className="os-event">{os.nomeEvento}</div>
                            {os.atendimento && os.atendimento.tecnicos && os.atendimento.tecnicos.length > 0 && (
                              <div className="os-team">
                                👥 {os.atendimento.tecnicos.length} técnico(s)
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
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
