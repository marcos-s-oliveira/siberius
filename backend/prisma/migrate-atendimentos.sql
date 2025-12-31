-- Script de migração de dados de AtendimentoOS para novo modelo
-- Execute este script APÓS rodar prisma migrate dev

-- Passo 1: Criar atendimentos únicos por OS
INSERT INTO atendimentos (
  "ordemServicoId",
  "dataAgendamento",
  status,
  observacoes,
  "criadoEm",
  "atualizadoEm"
)
SELECT DISTINCT ON (a."ordemServicoId")
  a."ordemServicoId",
  COALESCE(a."dataAtribuicao", os.data) as "dataAgendamento",
  CASE 
    WHEN a.status = 'pendente' THEN 'agendado'
    WHEN a.status = 'em_andamento' THEN 'em_andamento'
    WHEN a.status = 'concluido' THEN 'concluido'
    ELSE 'agendado'
  END as status,
  a.observacoes,
  MIN(a."criadoEm") as "criadoEm",
  MAX(a."atualizadoEm") as "atualizadoEm"
FROM atendimentos_os_old a
JOIN ordens_servico os ON os.id = a."ordemServicoId"
GROUP BY a."ordemServicoId", a."dataAtribuicao", a.status, a.observacoes, os.data
ON CONFLICT ("ordemServicoId") DO NOTHING;

-- Passo 2: Migrar alocações de técnicos
INSERT INTO tecnicos_atendimentos (
  "atendimentoId",
  "tecnicoId",
  funcao,
  "criadoEm",
  "atualizadoEm"
)
SELECT 
  atend.id as "atendimentoId",
  ao."tecnicoId",
  t.especialidade as funcao,
  ao."criadoEm",
  ao."atualizadoEm"
FROM atendimentos_os_old ao
JOIN atendimentos atend ON atend."ordemServicoId" = ao."ordemServicoId"
JOIN tecnicos t ON t.id = ao."tecnicoId"
ON CONFLICT ("atendimentoId", "tecnicoId") DO NOTHING;

-- Passo 3: Criar atendimentos para OSs sem atendimento (status: não agendado)
INSERT INTO atendimentos (
  "ordemServicoId",
  "dataAgendamento",
  status,
  "criadoEm",
  "atualizadoEm"
)
SELECT 
  os.id,
  os.data,
  'nao_agendado',
  NOW(),
  NOW()
FROM ordens_servico os
WHERE os.ativa = true
  AND NOT EXISTS (
    SELECT 1 FROM atendimentos a WHERE a."ordemServicoId" = os.id
  );

-- Passo 4: Após validar os dados, remover tabela antiga (CUIDADO!)
-- DROP TABLE atendimentos_os_old;

-- Verificações
SELECT 'Total OSs ativas:' as verificacao, COUNT(*) as total FROM ordens_servico WHERE ativa = true
UNION ALL
SELECT 'Total Atendimentos criados:', COUNT(*) FROM atendimentos
UNION ALL
SELECT 'Total Alocações de técnicos:', COUNT(*) FROM tecnicos_atendimentos
UNION ALL
SELECT 'OSs sem atendimento:', COUNT(*) 
FROM ordens_servico os 
WHERE ativa = true AND NOT EXISTS (SELECT 1 FROM atendimentos a WHERE a."ordemServicoId" = os.id);
