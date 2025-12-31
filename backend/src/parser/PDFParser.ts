import * as fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface ParsedPDFInfo {
  numeroOS: string;
  nomeCliente: string;
  nomeEvento: string;
  data: Date;
  osAtualizada: boolean;
  nomeArquivo: string;
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  warnings: string[];
  data: Omit<ParsedPDFInfo, 'nomeArquivo'> | null;
}

enum ValidationField {
  NumeroOS = 'numeroOS',
  NomeCliente = 'nomeCliente',
  NomeEvento = 'nomeEvento',
  Data = 'data'
}

export class PDFParser {
  /**
   * Faz o parse completo do arquivo PDF com validações rigorosas.
   * Valida tanto o conteúdo do PDF quanto o nome do arquivo.
   * Faz validação cruzada entre ambas as fontes de dados.
   * Só salva arquivos que atendam os requisitos mínimos de confiabilidade.
   * 
   * @param filepath Caminho completo do arquivo PDF
   * @param filename Nome do arquivo
   * @returns Informações parseadas e validadas do PDF
   * @throws Error se o arquivo não atender os requisitos mínimos
   */
  public static async parsePDFFile(filepath: string, filename: string): Promise<ParsedPDFInfo> {
    try {
      // Validar nome do arquivo
      const filenameResult = this.validateFilename(filename);
      
      // Ler PDF
      const dataBuffer = new Uint8Array(fs.readFileSync(filepath));
      
      if (dataBuffer.length < 100) {
        throw new Error('Arquivo PDF vazio ou corrompido');
      }
      
      const loadingTask = pdfjsLib.getDocument({
        data: dataBuffer,
        useSystemFonts: true,
        standardFontDataUrl: undefined
      });
      
      const pdfDocument = await loadingTask.promise;
      
      if (pdfDocument.numPages === 0) {
        throw new Error('PDF não contém páginas');
      }
      
      // Extrair texto
      let text = '';
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        text += pageText + '\n';
      }
      
      // Validar OS
      const isValidOS = this.hasValidOSPattern(text);
      
      if (!isValidOS && this.containsFinancialData(text)) {
        throw new Error('PDF descartado: Contém dados financeiros mas não é OS válida');
      }
      
      // Validar conteúdo e fazer cross-validation
      const contentResult = this.parseContentText(text);
      const finalData = this.crossValidate(contentResult, filenameResult, filename);
      
      return finalData;
      
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Erro ao validar ${filename}: ${String(error)}`);
    }
  }

  /**
   * Verifica se o PDF contém informações financeiras (valores em R$)
   * PDFs com valores financeiros devem ser descartados pois não são Ordens de Serviço válidas
   * 
   * @param text Texto extraído do PDF
   * @returns true se contém dados financeiros, false caso contrário
   */
  private static containsFinancialData(text: string): boolean {
    // Normalizar texto para busca case-insensitive
    const normalizedText = text.toLowerCase();
    
    // Verificar se contém ambos: "valor" e "R$"
    const hasValor = /\bvalor\b/i.test(normalizedText);
    const hasReais = /R\$|r\$|reais/i.test(text); // Manter case para R$
    
    if (hasValor && hasReais) {
      console.warn('    ⚠️  Detectado: "valor" E "R$" no conteúdo');
      return true;
    }
    
    return false;
  }

  /**
   * Verifica se o PDF é um ORÇAMENTO (e não uma Ordem de Serviço)
   * Orçamentos contêm indicadores específicos como:
   * - "Nº Dias" (coluna de número de dias)
   * - "Preço Unit." (preço unitário)
   * - "Valor" (valor total)
   * Apenas ORÇAMENTOS possuem TODAS estas palavras-chave juntas
   * 
   * @param text Texto extraído do PDF
   * @returns true se é um orçamento, false se é OS
   */
  private static isQuotationDocument(text: string): boolean {
    // Indicadores ESPECÍFICOS de ORÇAMENTO
    // Um orçamento deve ter TODAS estas colunas
    const hasNumeroDias = /N[ºo]\s*Dias/i.test(text);
    const hasPrecoUnit = /Pre[çc]o\s*Unit/i.test(text);
    const hasValor = /\bValor\b/i.test(text);
    
    // Se tem TODAS as três palavras-chave, é um orçamento
    if (hasNumeroDias && hasPrecoUnit && hasValor) {

      return true;
    }
    
    return false;
  }

  /**
   * Verifica se o PDF tem o padrão de uma Ordem de Serviço válida
   * Uma OS válida deve ter "Orçamento: [número]" seguido de "Campo Grande"
   * e NÃO deve ser um documento de orçamento
   * 
   * @param text Texto extraído do PDF
   * @returns true se tem padrão de OS válida, false caso contrário
   */
  private static hasValidOSPattern(text: string): boolean {
    // Primeiro verificar se é um orçamento
    if (this.isQuotationDocument(text)) {
      return false;
    }
    
    // Verificar o padrão principal de OS: "Orçamento: [número] ... Campo Grande"
    const osPattern = /Orçamento:\s*\d+.*?Campo\s+Grande/is;
    return osPattern.test(text);
  }

  /**
   * Extrai informações do texto do PDF usando delimitadores de palavras-chave
   * Retorna um ValidationResult com score de confiabilidade e erros/warnings
   */
  private static parseContentText(text: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    
    // Limpar texto de espaços extras
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    if (!cleanText || cleanText.length < 50) {
      errors.push('Conteúdo do PDF está vazio ou muito curto');
      return { isValid: false, score: 0, errors, warnings, data: null };
    }
    
    // 1. NÚMERO DA OS: entre 'Orçamento:' e 'Campo Grande' (OBRIGATÓRIO)
    const osRegex = /Orçamento:\s*(\d+).*?Campo\s+Grande/is;
    const osMatch = cleanText.match(osRegex);
    
    if (!osMatch || !osMatch[1]) {
      errors.push('Número da OS não encontrado no formato esperado (entre "Orçamento:" e "Campo Grande")');
      return { isValid: false, score: 0, errors, warnings, data: null };
    }
    
    const numeroOS = osMatch[1].trim();
    
    // Validar que numeroOS contém apenas dígitos
    if (!/^\d+$/.test(numeroOS)) {
      errors.push(`Número da OS inválido: "${numeroOS}" (deve conter apenas dígitos)`);
      return { isValid: false, score: 0, errors, warnings, data: null };
    }
    
    // Validar comprimento razoável (entre 1 e 10 dígitos)
    if (numeroOS.length < 1 || numeroOS.length > 10) {
      errors.push(`Número da OS com comprimento inválido: ${numeroOS.length} dígitos`);
      return { isValid: false, score: 0, errors, warnings, data: null };
    }
    
    score += 40; // NumeroOS encontrado = 40 pontos
    
    // 2. NOME DO CLIENTE (IMPORTANTE)
    let nomeCliente: string | null = null;
    
    // Primeira tentativa: entre 'A/C - Sr(ª).' e 'Tel:'
    const clienteRegex1 = /A\/C\s*-\s*Sr\(ª\)\.\s*(.+?)\s*Tel:/is;
    const clienteMatch1 = cleanText.match(clienteRegex1);
    
    if (clienteMatch1 && clienteMatch1[1]?.trim()) {
      nomeCliente = clienteMatch1[1].trim();
      
      // Limitar tamanho e limpar caracteres especiais excessivos
      if (nomeCliente.length > 100) {
        nomeCliente = nomeCliente.substring(0, 100);
        warnings.push('Nome do cliente muito longo, foi truncado para 100 caracteres');
      }
      
      // Validar que contém pelo menos algumas letras
      if (!/[a-zA-ZÀ-ÿ]{2,}/.test(nomeCliente)) {
        warnings.push(`Nome do cliente suspeito: "${nomeCliente}"`);
      } else {
        score += 20; // Nome do cliente válido = 20 pontos
      }
    } else {
      // Segunda tentativa: entre 'Horário da desmontagem: HH:ii' e 'CPF:'
      const clienteRegex2 = /Horário\s+da\s+desmontagem:\s*\d{2}:\d{2}\s*(.+?)\s*CPF:/is;
      const clienteMatch2 = cleanText.match(clienteRegex2);
      
      if (clienteMatch2 && clienteMatch2[1]?.trim()) {
        nomeCliente = clienteMatch2[1].trim();
        
        if (nomeCliente.length > 100) {
          nomeCliente = nomeCliente.substring(0, 100);
          warnings.push('Nome do cliente muito longo, foi truncado para 100 caracteres');
        }
        
        if (!/[a-zA-ZÀ-ÿ]{2,}/.test(nomeCliente)) {
          warnings.push(`Nome do cliente suspeito: "${nomeCliente}"`);
        } else {
          score += 20;
        }
      } else {
        warnings.push('Nome do cliente não encontrado nos padrões esperados');
      }
    }
    
    // 3. NOME DO EVENTO (IMPORTANTE)
    let nomeEvento: string | null = null;
    const eventoRegex = /Evento:\s*(.+?)\s*Data\(s\)\s+do\s+evento:/is;
    const eventoMatch = cleanText.match(eventoRegex);
    
    if (eventoMatch && eventoMatch[1]?.trim()) {
      nomeEvento = eventoMatch[1].trim();
      
      // Limitar tamanho
      if (nomeEvento.length > 200) {
        nomeEvento = nomeEvento.substring(0, 200);
        warnings.push('Nome do evento muito longo, foi truncado para 200 caracteres');
      }
      
      // Validar que contém pelo menos algumas letras
      if (!/[a-zA-ZÀ-ÿ]{2,}/.test(nomeEvento)) {
        warnings.push(`Nome do evento suspeito: "${nomeEvento}"`);
      } else {
        score += 20; // Nome do evento válido = 20 pontos
      }
    } else {
      warnings.push('Nome do evento não encontrado no formato esperado');
    }
    
    // 4. DATA DO EVENTO (IMPORTANTE)
    let data: Date | null = null;
    const dataRegex = /Data\(s\)\s+do\s+evento:\s*(.+?)\s*Horário\s+de\s+início\s+do\s+evento:/is;
    const dataMatch = cleanText.match(dataRegex);
    
    if (dataMatch && dataMatch[1]?.trim()) {
      const dataStr = dataMatch[1].trim();
      // Extrair primeira data no formato DD/MM/YYYY
      const datePattern = /(\d{2}\/\d{2}\/\d{4})/;
      const dateExtract = dataStr.match(datePattern);
      
      if (dateExtract) {
        try {
          data = this.parseDateBR(dateExtract[1]);
          
          // Validar que a data está em um intervalo razoável (não muito no passado ou futuro)
          const now = new Date();
          const minDate = new Date(2000, 0, 1); // 01/01/2000
          const maxDate = new Date(now.getFullYear() + 5, 11, 31); // 5 anos no futuro
          
          if (data < minDate || data > maxDate) {
            warnings.push(`Data do evento fora do intervalo esperado: ${dateExtract[1]}`);
          } else {
            score += 20; // Data válida = 20 pontos
          }
        } catch (error) {
          warnings.push(`Erro ao converter data: ${dateExtract[1]}`);
        }
      } else {
        warnings.push('Data do evento não encontrada no formato DD/MM/YYYY');
      }
    } else {
      warnings.push('Data do evento não encontrada no formato esperado');
    }
    
    // 5. VERIFICAR SE É OS ATUALIZADA
    const osAtualizada = /atualizada|revisão|versão\s*\d+|rev\s*\d+/i.test(cleanText);
    
    // REGRAS DE VALIDAÇÃO:
    // - Score mínimo de 60 pontos para ser considerado válido
    // - NumeroOS é obrigatório (já verificado acima)
    // - Pelo menos 2 dos 3 campos opcionais (cliente, evento, data) devem estar presentes
    
    const fieldsFound = [nomeCliente, nomeEvento, data].filter(f => f !== null).length;
    
    if (score < 60) {
      errors.push(`Score de confiabilidade muito baixo (${score}/100). Campos encontrados: ${fieldsFound}/3`);
      
      // Se encontrou APENAS numeroOS, retornar dados parciais com flag especial
      if (fieldsFound === 0) {
        return {
          isValid: false,
          score,
          errors,
          warnings,
          data: {
            numeroOS,
            nomeCliente: 'INCOMPLETO',
            nomeEvento: 'INCOMPLETO',
            data: new Date(1990, 0, 1), // Data especial para indicar que é incompleto
            osAtualizada: false,
          }
        };
      }
      
      return { isValid: false, score, errors, warnings, data: null };
    }
    
    // Dados validados com sucesso
    return {
      isValid: true,
      score,
      errors,
      warnings,
      data: {
        numeroOS,
        nomeCliente: nomeCliente || 'N/A',
        nomeEvento: nomeEvento || 'N/A',
        data: data || new Date(),
        osAtualizada,
      }
    };
  }

  /**
   * Converte string de data DD/MM/YYYY ou intervalo DD/MM/YYYY A DD/MM/YYYY para objeto Date
   * Para intervalos, retorna apenas a data inicial
   */
  private static parseDateBR(dateStr: string): Date {
    // Verificar se é um intervalo de datas com várias variações
    // Padrões: "DD/MM/YYYY A DD/MM/YYYY", "DD/MM/YYYY a DD/MM/YYYY", "DD/MM/YYYY À DD/MM/YYYY"
    const rangePattern = /(\d{2})\/(\d{2})\/(\d{4})\s*[AaÀà]\s*\d{2}\/\d{2}\/\d{4}/;
    const rangeMatch = dateStr.match(rangePattern);
    
    if (rangeMatch) {
      console.log('    → Intervalo de datas detectado no conteúdo PDF, usando data inicial');
      const day = parseInt(rangeMatch[1], 10);
      const month = parseInt(rangeMatch[2], 10);
      const year = parseInt(rangeMatch[3], 10);
      
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        throw new Error(`Data contém valores não numéricos: ${dateStr}`);
      }
      
      return new Date(year, month - 1, day);
    }
    
    // Parse normal para data única
    const parts = dateStr.split('/');
    
    if (parts.length !== 3) {
      throw new Error(`Formato de data inválido: ${dateStr}. Esperado DD/MM/YYYY ou DD/MM/YYYY A DD/MM/YYYY`);
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error(`Data contém valores não numéricos: ${dateStr}`);
    }

    // Criar data (mês é 0-indexed no JavaScript)
    return new Date(year, month - 1, day);
  }

  /**
   * Faz validação cruzada entre dados do conteúdo e do nome do arquivo
   * Retorna resultado combinado com melhor confiabilidade
   */
  private static crossValidate(
    contentResult: ValidationResult,
    filenameResult: ValidationResult,
    filename: string
  ): ParsedPDFInfo {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Se ambos falharam, lançar erro
    if (!contentResult.isValid && !filenameResult.isValid) {
      const allErrors = [
        'VALIDAÇÃO FALHOU - Arquivo não atende requisitos mínimos:',
        '--- Erros do conteúdo PDF ---',
        ...contentResult.errors,
        ...contentResult.warnings,
        '--- Erros do nome do arquivo ---',
        ...filenameResult.errors,
        ...filenameResult.warnings,
      ];
      throw new Error(allErrors.join('\n'));
    }
    
    // Se apenas o conteúdo é válido
    if (contentResult.isValid && !filenameResult.isValid) {
      warnings.push('Nome do arquivo não segue padrão esperado, usando dados do conteúdo PDF');
      console.warn(`⚠️  ${filename}: ${warnings[0]}`);
      
      return {
        ...contentResult.data!,
        nomeArquivo: filename,
      };
    }
    
    // Se apenas o nome do arquivo é válido
    if (!contentResult.isValid && filenameResult.isValid) {
      warnings.push('Conteúdo do PDF não passou na validação, usando dados do nome do arquivo');
      console.warn(`⚠️  ${filename}: ${warnings[0]}`);
      
      return {
        ...filenameResult.data!,
        nomeArquivo: filename,
      };
    }
    
    // Ambos são válidos - fazer validação cruzada e combinar
    const contentData = contentResult.data!;
    const filenameData = filenameResult.data!;
    
    // Validar número da OS
    const contentOS = contentData.numeroOS.replace(/^0+/, '') || '0';
    const filenameOS = filenameData.numeroOS.replace(/^0+/, '') || '0';
    
    if (contentOS !== filenameOS) {
      errors.push(
        `INCONSISTÊNCIA CRÍTICA: Número da OS diferente!\n` +
        `  - Conteúdo PDF: ${contentData.numeroOS}\n` +
        `  - Nome do arquivo: ${filenameData.numeroOS}`
      );
      throw new Error(errors.join('\n'));
    }
    
    // Verificar similaridade nos outros campos
    const contentCliente = contentData.nomeCliente.toUpperCase();
    const filenameCliente = filenameData.nomeCliente.toUpperCase();
    
    if (contentCliente !== 'N/A' && filenameCliente !== 'N/A') {
      // Verificar se há alguma similaridade (pelo menos 30% de overlap)
      const similarity = this.calculateSimilarity(contentCliente, filenameCliente);
      
      if (similarity < 0.3) {
        warnings.push(
          `Nome do cliente difere significativamente:\n` +
          `  - Conteúdo: ${contentData.nomeCliente}\n` +
          `  - Arquivo: ${filenameData.nomeCliente}`
        );
      }
    }
    
    // Priorizar dados do conteúdo (mais confiável) mas completar com dados do nome do arquivo
    const finalData: ParsedPDFInfo = {
      numeroOS: contentData.numeroOS,
      nomeCliente: contentData.nomeCliente !== 'N/A' 
        ? contentData.nomeCliente 
        : filenameData.nomeCliente,
      nomeEvento: contentData.nomeEvento !== 'N/A' 
        ? contentData.nomeEvento 
        : filenameData.nomeEvento,
      // Priorizar data do conteúdo se não for sentinela (1990=incompleto)
      // Só usar data do filename se conteúdo for incompleto E filename não for sentinela (1900)
      data: contentData.data.getFullYear() !== 1990 
        ? contentData.data 
        : (filenameData.data.getFullYear() !== 1900 ? filenameData.data : contentData.data),
      osAtualizada: contentData.osAtualizada || filenameData.osAtualizada,
      nomeArquivo: filename,
    };
    
    // Calcular score final combinado
    const finalScore = Math.max(contentResult.score, filenameResult.score);
    
    if (warnings.length > 0) {
      console.warn(`⚠️  ${filename} - Validação com avisos (score: ${finalScore}):`);
      warnings.forEach(w => console.warn(`    ${w}`));
    } else {
      console.log(`✓ ${filename} - Validado com sucesso (score: ${finalScore})`);
    }
    
    return finalData;
  }
  
  /**
   * Calcula similaridade entre duas strings (0-1)
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    // Contar caracteres em comum
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) {
        matches++;
      }
    }
    
    return matches / longer.length;
  }

  /**
   * Valida o nome do arquivo e extrai informações
   * Retorna ValidationResult com score e informações extraídas
   */
  private static validateFilename(filename: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    
    // Remover extensão .pdf se existir
    const nameWithoutExt = filename.replace(/\.pdf$/i, '');
    
    if (!nameWithoutExt || nameWithoutExt.length < 3) {
      errors.push('Nome do arquivo muito curto ou inválido');
      return { isValid: false, score: 0, errors, warnings, data: null };
    }
    
    // Extrair o número da OS ignorando caracteres não numéricos no início
    const numeroOSMatch = nameWithoutExt.match(/[^\d]*(\d+)/);
    
    if (!numeroOSMatch || !numeroOSMatch[1]) {
      errors.push('Não foi possível extrair o número da OS do nome do arquivo');
      return { isValid: false, score: 0, errors, warnings, data: null };
    }
    
    const numeroOS = numeroOSMatch[1];
    
    // Validar comprimento do numeroOS
    if (numeroOS.length < 1 || numeroOS.length > 10) {
      errors.push(`Número da OS no nome do arquivo com comprimento inválido: ${numeroOS.length} dígitos`);
      return { isValid: false, score: 0, errors, warnings, data: null };
    }
    
    score += 30; // Número da OS encontrado = 30 pontos
    
    // Tentar fazer o parse completo seguindo a estrutura esperada
    // Formato: $OSNumber - $ClientName - $EventName - $date(DD.MM.YYYY)
    // ou: $OSNumber - O.S ATUALIZADA - $ClientName - $EventName - $date(DD.MM.YYYY)
    
    const parts = nameWithoutExt.split(' - ').map(p => p.trim());
    
    if (parts.length < 2) {
      warnings.push('Nome do arquivo não segue o formato estruturado esperado');
      // Retornar apenas com numeroOS
      return {
        isValid: false,
        score,
        errors,
        warnings,
        data: {
          numeroOS,
          nomeCliente: 'N/A',
          nomeEvento: 'N/A',
          data: new Date(1900, 0, 1), // Data sentinela para indicar ausência de data no nome
          osAtualizada: false,
        }
      };
    }
    
    let nomeCliente: string | null = null;
    let nomeEvento: string | null = null;
    let dataStr: string | null = null;
    let osAtualizada = false;
    
    // Verificar se existe "O.S ATUALIZADA" ou similar
    const hasAtualizada = /O\.S\.?\s*ATUALIZADA|OS\s*ATUALIZADA|ATUALIZADA/i.test(nameWithoutExt);
    
    // Identificar se parts[1] é um marcador "O.S", "OS", "OS." que deve ser ignorado
    const isOSMarker = parts.length > 1 && /^O\.?S\.?$/i.test(parts[1]);
    
    if (hasAtualizada) {
      osAtualizada = true;
      score += 5; // Identificou OS atualizada = 5 pontos
      
      if (parts.length >= 5) {
        nomeCliente = parts[2];
        // Juntar todos os elementos restantes até o último (que é a data)
        nomeEvento = parts.slice(3, parts.length - 1).join(' - ');
        dataStr = parts[parts.length - 1];
      } else if (parts.length >= 4) {
        nomeCliente = parts[2];
        nomeEvento = parts[3];
      } else {
        warnings.push('Formato incompleto para OS atualizada');
      }
    } else if (isOSMarker) {
      // Formato: NumeroOS - O.S/OS/OS. - Cliente - Evento(s) - Data
      if (parts.length >= 5) {
        nomeCliente = parts[2];
        // Juntar todos os elementos do meio (entre cliente e data) como evento
        nomeEvento = parts.slice(3, parts.length - 1).join(' - ');
        dataStr = parts[parts.length - 1];
      } else if (parts.length >= 4) {
        nomeCliente = parts[2];
        nomeEvento = parts[3];
      } else {
        warnings.push('Formato incompleto após marcador OS');
      }
    } else {
      // Formato padrão: NumeroOS - Cliente - Evento(s) - Data
      if (parts.length >= 4) {
        nomeCliente = parts[1];
        // Juntar todos os elementos do meio como evento
        nomeEvento = parts.slice(2, parts.length - 1).join(' - ');
        dataStr = parts[parts.length - 1];
      } else if (parts.length >= 3) {
        nomeCliente = parts[1];
        nomeEvento = parts[2];
      } else {
        nomeCliente = parts[1];
      }
    }
    
    // Validar nome do cliente
    if (nomeCliente && nomeCliente !== 'O.S' && nomeCliente !== 'OS') {
      if (nomeCliente.length < 2) {
        warnings.push('Nome do cliente muito curto no nome do arquivo');
      } else if (nomeCliente.length > 100) {
        nomeCliente = nomeCliente.substring(0, 100);
        warnings.push('Nome do cliente muito longo, foi truncado');
      } else if (!/[a-zA-ZÀ-ÿ]{2,}/.test(nomeCliente)) {
        warnings.push(`Nome do cliente suspeito no arquivo: "${nomeCliente}"`);
      } else {
        score += 20; // Nome do cliente válido = 20 pontos
      }
    }
    
    // Validar nome do evento
    if (nomeEvento) {
      if (nomeEvento.length < 2) {
        warnings.push('Nome do evento muito curto no nome do arquivo');
      } else if (nomeEvento.length > 200) {
        nomeEvento = nomeEvento.substring(0, 200);
        warnings.push('Nome do evento muito longo, foi truncado');
      } else if (!/[a-zA-ZÀ-ÿ]{2,}/.test(nomeEvento)) {
        warnings.push(`Nome do evento suspeito no arquivo: "${nomeEvento}"`);
      } else {
        score += 20; // Nome do evento válido = 20 pontos
      }
    }
    
    // Parse da data
    let data: Date | null = null;
    
    if (dataStr) {
      try {
        data = this.parseDate(dataStr);
        
        // Validar intervalo da data
        const now = new Date();
        const minDate = new Date(2000, 0, 1);
        const maxDate = new Date(now.getFullYear() + 5, 11, 31);
        
        if (data < minDate || data > maxDate) {
          warnings.push(`Data fora do intervalo esperado no nome do arquivo: ${dataStr}`);
        } else {
          score += 30; // Data válida = 30 pontos
        }
      } catch (error) {
        warnings.push(`Erro ao converter data do nome do arquivo: ${dataStr}`);
      }
    } else {
      // Tentar extrair data do final do nome
      try {
        data = this.extractDateFromFilename(filename);
        score += 20; // Data encontrada de forma alternativa = 20 pontos
      } catch {
        warnings.push('Data não encontrada no nome do arquivo');
      }
    }
    
    // Validação final
    const fieldsFound = [nomeCliente, nomeEvento, data].filter(f => f !== null).length;
    
    if (score < 50) {
      errors.push(`Score de validação do nome do arquivo muito baixo (${score}/100). Campos: ${fieldsFound}/3`);
      return { isValid: false, score, errors, warnings, data: null };
    }
    
    return {
      isValid: true,
      score,
      errors,
      warnings,
      data: {
        numeroOS,
        nomeCliente: nomeCliente || 'N/A',
        nomeEvento: nomeEvento || 'N/A',
        data: data || new Date(1900, 0, 1), // Data sentinela para indicar ausência de data no nome
        osAtualizada,
      }
    };
  }

  /**
   * Tenta extrair data do final do nome do arquivo
   * Formatos aceitos: DD.MM.YYYY, DD.MM, ou intervalos DD.MM.YYYY A DD.MM.YYYY
   * Para intervalos, extrai apenas a data inicial
   */
  private static extractDateFromFilename(filename: string): Date {
    // Remover extensão se houver
    const nameWithoutExt = filename.replace(/\.pdf$/i, '');
    
    // Tentar encontrar padrão de intervalo: DD.MM.YYYY A DD.MM.YYYY
    const dateRangePattern = /(\d{2})\.(\d{2})\.(\d{4})\s*[AaÀà]\s*\d{2}\.\d{2}\.\d{4}/;
    let match = nameWithoutExt.match(dateRangePattern);
    if (match) {
      console.log('    → Intervalo de datas detectado, usando data inicial');
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      return new Date(year, month - 1, day);
    }
    
    // Tentar encontrar padrão DD.MM.YYYY
    const datePatternFull = /(\d{2})\.(\d{2})\.(\d{4})(?:\s|$)/;
    match = nameWithoutExt.match(datePatternFull);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      return new Date(year, month - 1, day);
    }
    
    // Tentar padrão DD.MM (sem ano)
    const datePatternShort = /(\d{2})\.(\d{2})(?:\s|$|\.pdf$)/i;
    match = nameWithoutExt.match(datePatternShort);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = new Date().getFullYear();
      return new Date(year, month - 1, day);
    }
    
    throw new Error('Nenhuma data encontrada no nome do arquivo');
  }

  /**
   * Converte string de data DD.MM.YYYY, DD.MM, ou intervalo DD.MM.YYYY A DD.MM.YYYY para objeto Date
   * Para intervalos, retorna apenas a data inicial
   * Se o ano não for fornecido, usa o ano atual
   */
  private static parseDate(dateStr: string): Date {
    // Verificar se é um intervalo de datas (DD.MM.YYYY A DD.MM.YYYY)
    const rangePattern = /(\d{2})\.(\d{2})\.(\d{4})\s*[AaÀà]\s*\d{2}\.\d{2}\.\d{4}/;
    const rangeMatch = dateStr.match(rangePattern);
    
    if (rangeMatch) {
      console.log('    → Intervalo de datas detectado no parse, usando data inicial');
      const day = parseInt(rangeMatch[1], 10);
      const month = parseInt(rangeMatch[2], 10);
      const year = parseInt(rangeMatch[3], 10);
      
      if (day < 1 || day > 31) {
        throw new Error(`Dia inválido: ${day}`);
      }
      if (month < 1 || month > 12) {
        throw new Error(`Mês inválido: ${month}`);
      }
      
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) {
        throw new Error(`Data inválida: ${dateStr}`);
      }
      return date;
    }
    
    // Parse normal para data única
    const parts = dateStr.split('.');
    
    if (parts.length < 2 || parts.length > 3) {
      throw new Error(`Formato de data inválido: ${dateStr}. Esperado DD.MM.YYYY, DD.MM ou DD.MM.YYYY A DD.MM.YYYY`);
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    // Se o ano não foi fornecido, usa o ano atual
    const year = parts.length === 3 ? parseInt(parts[2], 10) : new Date().getFullYear();

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error(`Data contém valores não numéricos: ${dateStr}`);
    }

    if (day < 1 || day > 31) {
      throw new Error(`Dia inválido: ${day}`);
    }

    if (month < 1 || month > 12) {
      throw new Error(`Mês inválido: ${month}`);
    }

    // Criar data (mês é 0-indexed no JavaScript)
    const date = new Date(year, month - 1, day);

    // Validar se a data é válida
    if (isNaN(date.getTime())) {
      throw new Error(`Data inválida: ${dateStr}`);
    }

    return date;
  }
}
