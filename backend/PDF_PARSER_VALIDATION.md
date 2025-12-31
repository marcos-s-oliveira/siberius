# Sistema de Validação do PDFParser

## Visão Geral

O PDFParser foi completamente reformulado com um sistema robusto de validação que garante que apenas arquivos PDF com informações consistentes e confiáveis sejam salvos no banco de dados.

## Melhorias Implementadas

### 0. Validação Financeira (CRÍTICA - Primeira Verificação)

**PDFs são verificados em duas etapas:**

1. **Primeiro**: Verifica se é uma Ordem de Serviço válida
   - Procura pelo padrão: `Orçamento: [número] ... Campo Grande`
   - Se encontrado → É uma OS válida

2. **Segundo**: Se NÃO é uma OS válida, verifica dados financeiros
   - Se contém "valor" + "R$" → DESCARTA (é orçamento/fatura)

#### Exceção Importante - Grupo Gerador:
OSs que contêm locação de grupo gerador incluem um texto padrão com valores em R$ (tarifa de R$ 2.500,00 stand by, R$ 3.000,00 em uso, etc.). Estes arquivos **SÃO ACEITOS** porque primeiro é verificado que são OSs válidas (têm o padrão "Orçamento: número ... Campo Grande").

#### Lógica de Decisão:
```
SE (tem padrão "Orçamento: [número] ... Campo Grande")
  ENTÃO → ACEITAR (é OS válida, mesmo com valores financeiros)
SENÃO SE (contém "valor" E "R$")
  ENTÃO → DESCARTAR (é orçamento/fatura, não é OS)
SENÃO
  → Continuar validação normal
FIM
```

#### Exemplos:

**ACEITO** ✅ (OS válida com gerador):
```
Orçamento: 12680
Campo Grande - MS
Cliente: BEATRIZ LINS
Evento: Festa
Data: 30/12/2025

Política de Preços para o Gerador de 180 kVA
Stand By: R$ 2.500,00
Em Uso: R$ 3.000,00
Taxa hora extra: R$ 350,00
Valor total conforme uso.
```
→ Tem padrão de OS + valores do gerador = ACEITO

**DESCARTADO** ❌ (orçamento, não é OS):
```
Orçamento para Evento XYZ
Cliente: João Silva
Valor Total: R$ 5.000,00
Itens:
- Som: R$ 2.000,00
- Iluminação: R$ 3.000,00
```
→ Não tem padrão de OS + tem valores = DESCARTADO

**ACEITO** ✅ (tem "valor" mas não tem R$):
```
Orçamento: 12345
Campo Grande - MS
Este evento tem grande valor sentimental.
```
→ Tem padrão de OS + não tem valores financeiros = ACEITO

**ACEITO** ✅ (tem R$ mas não tem "valor"):
```
Orçamento: 9999
Campo Grande - MS
Equipamentos R$ound Systems
```
→ Tem padrão de OS + não tem contexto financeiro = ACEITO

### 1. Sistema de Pontuação (Score)

Cada PDF é avaliado com um score de 0 a 100 pontos baseado na qualidade e completude das informações:

#### Validação do Conteúdo do PDF (máximo 100 pontos):
- **Número da OS** (obrigatório): 40 pontos
- **Nome do Cliente**: 20 pontos
- **Nome do Evento**: 20 pontos
- **Data do Evento**: 20 pontos
- **Score mínimo para aprovação**: 60 pontos

#### Validação do Nome do Arquivo (máximo 100 pontos):
- **Número da OS** (obrigatório): 30 pontos
- **Nome do Cliente**: 20 pontos
- **Nome do Evento**: 20 pontos
- **Data**: 30 pontos
- **OS Atualizada** (opcional): 5 pontos
- **Score mínimo para aprovação**: 50 pontos

### 2. Validações Rigorosas

#### Número da OS:
- Deve estar presente no formato esperado (entre "Orçamento:" e "Campo Grande")
- Apenas dígitos permitidos
- Comprimento entre 1-10 dígitos
- **CRÍTICO**: Inconsistências entre conteúdo e nome do arquivo causam rejeição

#### Nome do Cliente:
- Deve conter pelo menos 2 caracteres alfabéticos
- Tamanho máximo de 100 caracteres (truncado se maior)
- Padrões esperados no PDF:
  - Entre "A/C - Sr(ª)." e "Tel:"
  - Entre "Horário da desmontagem: HH:ii" e "CPF:"

#### Nome do Evento:
- Deve conter pelo menos 2 caracteres alfabéticos
- Tamanho máximo de 200 caracteres (truncado se maior)
- Padrão esperado: Entre "Evento:" e "Data(s) do evento:"

#### Data do Evento:
- Formato esperado: DD/MM/YYYY (no conteúdo) ou DD.MM.YYYY (no nome)
- **Suporte a intervalos**: DD/MM/YYYY A DD/MM/YYYY ou DD.MM.YYYY A DD.MM.YYYY
  - Para intervalos, extrai apenas a **data inicial**
  - Aceita variações: "A", "a", "À", "à"
- Validação de intervalo: entre 01/01/2000 e 5 anos no futuro
- Deve ser uma data válida no calendário

**Exemplos de datas aceitas**:
- `15/06/2025` → Data única
- `15/06/2025 A 20/06/2025` → Intervalo (usa 15/06/2025)
- `10.03.2025 a 12.03.2025` → Intervalo no nome (usa 10/03/2025)
- `25/12/2025 à 31/12/2025` → Intervalo com à (usa 25/12/2025)

### 3. Validação Cruzada

O sistema compara as informações extraídas do conteúdo do PDF com as do nome do arquivo:

1. **Número da OS**: Deve ser IDÊNTICO (após remover zeros à esquerda)
   - Inconsistência = Rejeição do arquivo

2. **Nome do Cliente**: Comparação de similaridade (mínimo 30%)
   - Diferença significativa = Warning (mas não rejeita)

3. **Priorização**: Dados do conteúdo têm prioridade sobre o nome do arquivo
   - Se um campo não for encontrado no conteúdo, usa o do nome do arquivo

### 4. Regras de Salvamento

Um PDF será **ACEITO** se:
- Score do conteúdo ≥ 60 pontos **OU** score do nome ≥ 50 pontos
- Número da OS é válido e consistente
- Pelo menos 2 dos 3 campos opcionais (cliente, evento, data) estão presentes

Um PDF será **REJEITADO** se:
- **Contém "valor" E "R$" no conteúdo** (validação financeira - primeira verificação)
- Ambas validações (conteúdo e nome) falharem
- Número da OS não for encontrado
- Inconsistência no número da OS entre conteúdo e nome
- Score muito baixo em ambas as fontes
- PDF vazio ou corrompido (< 100 bytes)
- PDF sem páginas

### 5. Tratamento de Erros e Warnings

O sistema fornece feedback detalhado sobre cada validação:

#### Erros (impedem salvamento):
```
VALIDAÇÃO FALHOU - Arquivo não atende requisitos mínimos:
--- Erros do conteúdo PDF ---
  - Número da OS não encontrado no formato esperado
  - Score de confiabilidade muito baixo (40/100)
--- Erros do nome do arquivo ---
  - Score de validação do nome do arquivo muito baixo (30/100)
```

#### Warnings (arquivo aceito com ressalvas):
```
⚠️  Nome do cliente difere significativamente:
    - Conteúdo: João Silva
    - Arquivo: João S.
⚠️  Data do evento fora do intervalo esperado: 01/01/1999
```

## Exemplos de Uso

### Arquivo Aceito (Score Alto)
```
Arquivo: 12345 - João Silva - Casamento - 15.06.2025.pdf

Validação:
✓ Conteúdo: 80/100 pontos
  ✓ OS: 12345 (40 pts)
  ✓ Cliente: João Silva (20 pts)
  ✓ Evento: Casamento (20 pts)
  - Data: não encontrada (0 pts)

✓ Nome: 100/100 pontos
  ✓ OS: 12345 (30 pts)
  ✓ Cliente: João Silva (20 pts)
  ✓ Evento: Casamento (20 pts)
  ✓ Data: 15.06.2025 (30 pts)

✅ APROVADO - Score final: 100
```

### Arquivo Aceito com Intervalo de Datas
```
Arquivo: 12345 - João Silva - Festival - 15.06.2025 A 20.06.2025.pdf

Validação:
✓ Conteúdo: 100/100 pontos
  ✓ OS: 12345 (40 pts)
  ✓ Cliente: João Silva (20 pts)
  ✓ Evento: Festival (20 pts)
  ✓ Data: 15/06/2025 A 20/06/2025 → 15/06/2025 (20 pts)
    → Intervalo de datas detectado, usando data inicial

✓ Nome: 100/100 pontos
  ✓ OS: 12345 (30 pts)
  ✓ Cliente: João Silva (20 pts)
  ✓ Evento: Festival (20 pts)
  ✓ Data: 15.06.2025 A 20.06.2025 → 15.06.2025 (30 pts)
    → Intervalo de datas detectado, usando data inicial

✅ APROVADO - Score final: 100
   Data do evento: 15/06/2025 (início do evento)
```

### Arquivo Aceito com Warnings
```
Arquivo: 8020 - Cliente XYZ - Evento ABC.pdf

Validação:
✓ Conteúdo: 80/100 pontos
⚠️  Data não encontrada no formato esperado

✗ Nome: 30/100 pontos
⚠️  Data não encontrada no nome do arquivo

⚠️  APROVADO COM RESSALVAS - Score final: 80
    - Usando data atual como fallback
```

### Arquivo Rejeitado (Dados Financeiros)
```
Arquivo: 12345 - Cliente - Evento.pdf

Validação:
🔍 Validando: 12345 - Cliente - Evento.pdf
  → Validando nome do arquivo...
  → Lendo conteúdo do PDF...
  → Extraindo texto do PDF...
  → Texto extraído: 1523 caracteres de 2 página(s)
  → Verificando presença de valores financeiros...
    ⚠️  Detectado: "valor" E "R$" no conteúdo

❌ REJEITADO - PDF DESCARTADO
   Contém informações financeiras (valores em R$)
   Este arquivo não é uma Ordem de Serviço válida
```

### Arquivo Rejeitado (Dados Incompletos)
```
Arquivo: documento.pdf

Validação:
✗ Conteúdo: 0/100 pontos
  ✗ Número da OS não encontrado
  
✗ Nome: 0/100 pontos
  ✗ Não foi possível extrair número da OS

❌ REJEITADO - Não atende requisitos mínimos
```

### Inconsistência Crítica
```
Arquivo: 12345 - Cliente - Evento.pdf

Validação:
Conteúdo: OS = 8020
Nome: OS = 12345

❌ REJEITADO - INCONSISTÊNCIA CRÍTICA
   Número da OS diferente entre conteúdo e nome!
```

## Impacto no Sistema

### Antes
- Aceitava qualquer PDF com número no nome
- Dados incompletos salvos como "N/A"
- Sem validação cruzada
- Muitos registros com informações inválidas
- **PDFs com valores financeiros eram aceitos**

### Depois
- **Validação financeira imediata (primeira verificação)**
- Apenas PDFs com informações confiáveis são salvos
- Validação rigorosa do conteúdo e nome do arquivo
- Validação cruzada previne inconsistências
- Feedback detalhado sobre cada validação
- Sistema de pontuação transparente
- Logs informativos para debugging

## Monitoramento

O sistema registra no console cada etapa da validação:

```
🔍 Validando: 12345 - João Silva - Casamento - 15.06.2025.pdf
  → Validando nome do arquivo...
  → Lendo conteúdo do PDF...
  → Extraindo texto do PDF...
  → Texto extraído: 15234 caracteres de 3 página(s)
  → Verificando presença de valores financeiros...
  → Validando conteúdo extraído...
  → Fazendo validação cruzada...
  ✅ Validação completa: OS 12345
```

Em caso de falha:
```
🔍 Validando: arquivo_invalido.pdf
  → Validando nome do arquivo...
  → Lendo conteúdo do PDF...
  → Texto extraído: 523 caracteres de 1 página(s)
  → Verificando presença de valores financeiros...
  → Validando conteúdo extraído...
    ⚠️  Número da OS não encontrado no formato esperado
  → Fazendo validação cruzada...
  ❌ FALHA NA VALIDAÇÃO: arquivo_invalido.pdf
     VALIDAÇÃO FALHOU - Arquivo não atende requisitos mínimos
```

## Conclusão

O novo sistema de validação garante a integridade e confiabilidade dos dados salvos no banco de dados, rejeitando arquivos que não atendam os padrões mínimos de qualidade e fornecendo feedback detalhado para facilitar o debugging e a correção de problemas.
