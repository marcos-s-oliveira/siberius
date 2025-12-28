export interface ParsedPDFInfo {
  numeroOS: string;
  nomeCliente: string;
  nomeEvento: string;
  data: Date;
  osAtualizada: boolean;
  nomeArquivo: string;
}

export class PDFParser {
  /**
   * Faz o parse do nome do arquivo PDF seguindo a estrutura:
   * $OSNumber - $ClientName - $EventName - $date(DD.MM.YYYY)
   * ou
   * $OSNumber - O.S ATUALIZADA - $ClientName - $EventName - $date(DD.MM.YYYY)
   * 
   * @param filename Nome do arquivo (com ou sem extensão)
   * @returns Informações parseadas do PDF
   */
  public static parseFilename(filename: string): ParsedPDFInfo {
    // Remover extensão .pdf se existir
    const nameWithoutExt = filename.replace(/\.pdf$/i, '');
    
    // Dividir por ' - ' (espaço-traço-espaço)
    const parts = nameWithoutExt.split(' - ').map(p => p.trim());

    if (parts.length < 4) {
      throw new Error(`Formato de arquivo inválido: ${filename}. Esperado pelo menos 4 partes separadas por ' - '`);
    }

    let numeroOS: string;
    let nomeCliente: string;
    let nomeEvento: string;
    let dataStr: string;
    let osAtualizada = false;

    // Verificar se existe o campo "O.S ATUALIZADA" na segunda posição
    if (parts[1] === 'O.S ATUALIZADA') {
      osAtualizada = true;
      
      if (parts.length < 5) {
        throw new Error(`Formato de arquivo inválido: ${filename}. Esperado 5 partes quando contém 'O.S ATUALIZADA'`);
      }
      
      numeroOS = parts[0];
      nomeCliente = parts[2];
      nomeEvento = parts[3];
      dataStr = parts[4];
    } else if (parts[1] === 'O.S') {
      // Se o campo [1] for apenas "O.S", ignora e usa [2] como nome do cliente
      if (parts.length < 5) {
        throw new Error(`Formato de arquivo inválido: ${filename}. Esperado 5 partes quando contém 'O.S'`);
      }
      
      numeroOS = parts[0];
      nomeCliente = parts[2];
      nomeEvento = parts[3];
      dataStr = parts[4];
    } else {
      numeroOS = parts[0];
      nomeCliente = parts[1];
      nomeEvento = parts[2];
      dataStr = parts[3];
    }

    // Parse da data (DD.MM.YYYY)
    const data = this.parseDate(dataStr);

    return {
      numeroOS,
      nomeCliente,
      nomeEvento,
      data,
      osAtualizada,
      nomeArquivo: filename,
    };
  }

  /**
   * Converte string de data DD.MM.YYYY para objeto Date
   */
  private static parseDate(dateStr: string): Date {
    const parts = dateStr.split('.');
    
    if (parts.length !== 3) {
      throw new Error(`Formato de data inválido: ${dateStr}. Esperado DD.MM.YYYY`);
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

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

  /**
   * Valida se o arquivo segue o padrão esperado
   */
  public static isValidFilename(filename: string): boolean {
    try {
      this.parseFilename(filename);
      return true;
    } catch {
      return false;
    }
  }
}
