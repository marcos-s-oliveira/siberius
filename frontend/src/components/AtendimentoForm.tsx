import { useState } from 'react';
import type { Atendimento, OrdemServico, Tecnico } from '../types';
import { atendimentosAPI } from '../services/api';
import './Form.css';

interface AtendimentoFormProps {
  atendimento?: Atendimento | null;
  ordens: OrdemServico[];
  tecnicos: Tecnico[];
  onSave: () => void;
  onCancel: () => void;
}

interface TecnicoFormData {
  tecnicoId: number;
  funcao: string;
}

function AtendimentoForm({ atendimento, ordens, tecnicos, onSave, onCancel }: AtendimentoFormProps) {
  const [ordemServicoId, setOrdemServicoId] = useState<number>(atendimento?.ordemServicoId || 0);
  const [dataAgendamento, setDataAgendamento] = useState<string>(() => {
    if (atendimento?.dataAgendamento) {
      return atendimento.dataAgendamento.split('T')[0];
    }
    return '';
  });
  const [status, setStatus] = useState<'nao_agendado' | 'agendado' | 'em_andamento' | 'concluido' | 'cancelado'>(atendimento?.status || 'agendado');
  const [observacoes, setObservacoes] = useState<string>(atendimento?.observacoes || '');
  const [equipe, setEquipe] = useState<TecnicoFormData[]>(() => {
    if (atendimento?.tecnicos && atendimento.tecnicos.length > 0) {
      return atendimento.tecnicos.map(t => ({
        tecnicoId: t.tecnicoId,
        funcao: t.funcao || ''
      }));
    }
    return [{ tecnicoId: 0, funcao: '' }];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTecnico = () => {
    setEquipe([...equipe, { tecnicoId: 0, funcao: '' }]);
  };

  const removeTecnico = (index: number) => {
    if (equipe.length === 1) {
      alert('É necessário pelo menos um técnico no atendimento');
      return;
    }
    setEquipe(equipe.filter((_, i) => i !== index));
  };

  const updateTecnico = (index: number, field: 'tecnicoId' | 'funcao', value: any) => {
    const newEquipe = [...equipe];
    newEquipe[index] = { ...newEquipe[index], [field]: value };
    setEquipe(newEquipe);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!ordemServicoId) {
      setError('Selecione uma ordem de serviço');
      return;
    }

    if (!dataAgendamento) {
      setError('Informe a data de agendamento');
      return;
    }

    const tecnicosValidos = equipe.filter(t => t.tecnicoId > 0);
    if (tecnicosValidos.length === 0) {
      setError('Selecione pelo menos um técnico');
      return;
    }

    // Verificar duplicatas
    const tecnicoIds = tecnicosValidos.map(t => t.tecnicoId);
    const temDuplicata = tecnicoIds.some((id, index) => tecnicoIds.indexOf(id) !== index);
    if (temDuplicata) {
      setError('Não é possível adicionar o mesmo técnico mais de uma vez');
      return;
    }

    try {
      setLoading(true);

      const data = {
        ordemServicoId,
        dataAgendamento: new Date(dataAgendamento).toISOString(),
        status,
        observacoes: observacoes || undefined,
        tecnicos: tecnicosValidos
      };

      if (atendimento) {
        await atendimentosAPI.update(atendimento.id, data as any);
      } else {
        await atendimentosAPI.create(data as any);
      }

      onSave();
    } catch (err: any) {
      setError(err.userMessage || 'Erro ao salvar atendimento');
    } finally {
      setLoading(false);
    }
  };

  const ordensDisponiveis = ordens.filter(o => {
    // Se está editando, incluir a OS atual
    if (atendimento && o.id === atendimento.ordemServicoId) {
      return true;
    }
    // Caso contrário, mostrar apenas OSs sem atendimento
    return !o.atendimento;
  });

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{atendimento ? 'Editar Atendimento' : 'Novo Atendimento'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="ordemServico">Ordem de Serviço *</label>
          <select
            id="ordemServico"
            className="form-input"
            value={ordemServicoId}
            onChange={(e) => setOrdemServicoId(Number(e.target.value))}
            disabled={!!atendimento}
            required
          >
            <option value={0}>Selecione uma OS</option>
            {ordensDisponiveis.map(os => (
              <option key={os.id} value={os.id}>
                {os.numeroOS} - {os.nomeCliente} - {os.nomeEvento}
              </option>
            ))}
          </select>
          {atendimento && (
            <small className="form-hint">A ordem de serviço não pode ser alterada após criação</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="dataAgendamento">Data de Agendamento *</label>
          <input
            type="date"
            id="dataAgendamento"
            className="form-input"
            value={dataAgendamento}
            onChange={(e) => setDataAgendamento(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status *</label>
          <select
            id="status"
            className="form-input"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'nao_agendado' | 'agendado' | 'em_andamento' | 'concluido' | 'cancelado')}
            required
          >
            <option value="nao_agendado">Não Agendado</option>
            <option value="agendado">Agendado</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <label>Equipe de Técnicos *</label>
            <button type="button" className="btn-sm btn-primary" onClick={addTecnico}>
              + Adicionar Técnico
            </button>
          </div>

          {equipe.map((tec, index) => (
            <div key={index} className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor={`tecnico-${index}`}>Técnico</label>
                <select
                  id={`tecnico-${index}`}
                  className="form-input"
                  value={tec.tecnicoId}
                  onChange={(e) => updateTecnico(index, 'tecnicoId', Number(e.target.value))}
                  required
                >
                  <option value={0}>Selecione um técnico</option>
                  {tecnicos.filter(t => t.ativo).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome} {t.especialidade ? `(${t.especialidade})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor={`funcao-${index}`}>Função</label>
                <input
                  type="text"
                  id={`funcao-${index}`}
                  className="form-input"
                  value={tec.funcao}
                  onChange={(e) => updateTecnico(index, 'funcao', e.target.value)}
                  placeholder="Ex: Áudio, Iluminação"
                />
              </div>

              <div className="form-group" style={{ flex: 0 }}>
                <label>&nbsp;</label>
                <button
                  type="button"
                  className="btn-icon btn-delete"
                  onClick={() => removeTecnico(index)}
                  title="Remover técnico"
                  disabled={equipe.length === 1}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label htmlFor="observacoes">Observações</label>
          <textarea
            id="observacoes"
            className="form-input"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
            placeholder="Informações adicionais sobre o atendimento..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AtendimentoForm;
