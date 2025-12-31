# PDF Parser - Documentação

## Visão Geral

O PDFParser agora faz parse do **conteúdo interno do PDF** para extrair informações do cabeçalho, com fallback para o nome do arquivo caso o parse do conteúdo falhe.

## Estratégia de Parse

### 1. Parse do Conteúdo do PDF (Prioridade)

O parser extrai as seguintes informações do texto do PDF:

#### **Número da OS (Orçamento)**
```
Orçamento: 0000012257
```
Regex: `/Orçamento:\s*(\d+)/i`

#### **Nome do Cliente**
```
EUNAMAN SERVICOS MECANICOS LTDA CNPJ: 20.089.684/0007-42
```
Regex: `/([A-ZÀ-Ú][A-ZÀ-Ú\s.&-]+)\s+CNPJ:/i`

Extrai o nome da empresa que aparece antes do CNPJ.

#### **Nome do Evento**
```
Evento:
```
Regex: `/Evento:\s*([^\n]+)/i`

Extrai o texto que aparece após "Evento:" até a quebra de linha.

#### **Data**
Prioridade de busca:
1. **Data do evento**: `Data(s) do evento: 01/01/2026 à 07/01/2026`
2. **Data da montagem**: `Data(s) da montagem: 01/12/2025`
3. **Data do cabeçalho**: `Campo Grande, 04/11/2025`

Regex para data: `/(\d{2}\/\d{2}\/\d{4})/`

#### **OS Atualizada**
Verifica se o texto contém palavras-chave:
- "atualizada"
- "revisão"
- "versão" seguido de número

Regex: `/atualizada|revisão|versão\s*\d+/i`

### 2. Parse do Nome do Arquivo (Fallback)

Se o parse do conteúdo falhar ou não encontrar informações suficientes, usa o nome do arquivo.

#### Formatos Aceitos:

**Formato Completo:**
```
8020 - Cliente - Evento - 29.12.2025.pdf
```

**Formato com OS Atualizada:**
```
8020 - O.S ATUALIZADA - Cliente - Evento - 29.12.2025.pdf
```

**Formato Flexível (apenas número):**
```
ABC8020.pdf → numeroOS: "8020"
OS_8020.pdf → numeroOS: "8020"
Pedido 8020.pdf → numeroOS: "8020"
```

#### Extração do Número

- **Ignora caracteres não numéricos** no início do nome
- Usa regex: `/[^\d]*(\d+)/` para encontrar o primeiro número
- Se não houver outros dados, preenche com "N/A"

## Exemplo de Uso

```typescript
import { PDFParser } from './parser/PDFParser';

// Parse completo (conteúdo + fallback)
const info = await PDFParser.parsePDFFile('/path/to/file.pdf', 'file.pdf');

// Parse apenas do nome do arquivo
const infoFromName = PDFParser.parseFilename('8020 - Cliente - Evento - 29.12.2025.pdf');
```

## Formato de Retorno

```typescript
interface ParsedPDFInfo {
  numeroOS: string;        // "0000012257" ou "8020"
  nomeCliente: string;     // "EUNAMAN SERVICOS MECANICOS LTDA" ou "N/A"
  nomeEvento: string;      // Nome do evento ou "N/A"
  data: Date;              // Data extraída ou data atual
  osAtualizada: boolean;   // true se encontrar palavras-chave
  nomeArquivo: string;     // Nome original do arquivo
}
```

## Dependências

- **pdf-parse**: Biblioteca para extrair texto de arquivos PDF
- **fs**: Módulo nativo para leitura de arquivos

## Instalação

```bash
npm install pdf-parse
npm install -D @types/pdf-parse
```

## Tratamento de Erros

- Se o PDF não puder ser lido, usa o nome do arquivo
- Se o nome não tiver número, lança erro
- Se dados estiverem incompletos, preenche com "N/A"
- Se a data for inválida, usa a data atual

## Logs

O parser emite avisos no console quando:
- Falha ao ler o conteúdo do PDF
- Falha ao extrair informações do texto
- Usa fallback para o nome do arquivo
