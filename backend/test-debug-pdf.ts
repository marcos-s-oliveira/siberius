import * as fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as path from 'path';

async function debugPDFContent() {
  const filepath = 'C:/serviceOrder/CLIENTES/ANDERSON RIBEIRO/O.S. - 9381 - ANDERSON RIBEIRO - CORTESIA.pdf';
  const filename = path.basename(filepath);
  
  console.log('=== DEBUG DO CONTEÚDO DO PDF ===');
  console.log(`Arquivo: ${filename}`);
  console.log('');
  
  try {
    // Ler o arquivo
    const dataBuffer = new Uint8Array(fs.readFileSync(filepath));
    console.log(`Tamanho do arquivo: ${dataBuffer.length} bytes`);
    
    // Carregar PDF
    const loadingTask = pdfjsLib.getDocument({
      data: dataBuffer,
      useSystemFonts: true,
      standardFontDataUrl: undefined
    });
    
    const pdfDocument = await loadingTask.promise;
    console.log(`Número de páginas: ${pdfDocument.numPages}`);
    console.log('');
    
    // Extrair texto de todas as páginas
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      console.log(`--- Página ${pageNum} ---`);
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
      console.log(pageText.substring(0, 500) + '...');
      console.log('');
    }
    
    // Buscar por padrões de data
    console.log('\n=== BUSCANDO PADRÕES DE DATA ===');
    
    // Buscar "Data(s) do evento:"
    const dataEventoRegex = /Data\(s\)\s+do\s+evento:\s*(.+?)\s*Horário\s+de\s+início\s+do\s+evento:/is;
    const dataEventoMatch = fullText.match(dataEventoRegex);
    
    if (dataEventoMatch) {
      console.log('✓ Encontrado padrão "Data(s) do evento:"');
      console.log('  Texto capturado:', dataEventoMatch[1]);
      
      // Tentar extrair data no formato DD/MM/YYYY
      const datePattern = /(\d{2}\/\d{2}\/\d{4})/g;
      const dates = dataEventoMatch[1].match(datePattern);
      
      if (dates) {
        console.log('  Datas encontradas:', dates);
      }
    } else {
      console.log('✗ Padrão "Data(s) do evento:" NÃO encontrado');
    }
    
    // Buscar todas as datas no formato DD/MM/YYYY no texto completo
    console.log('\n=== TODAS AS DATAS NO FORMATO DD/MM/YYYY ===');
    const allDatesPattern = /(\d{2}\/\d{2}\/\d{4})/g;
    const allDates = fullText.match(allDatesPattern);
    
    if (allDates) {
      console.log('Datas encontradas no documento:');
      allDates.forEach((date, index) => {
        console.log(`  ${index + 1}. ${date}`);
      });
    } else {
      console.log('Nenhuma data no formato DD/MM/YYYY encontrada');
    }
    
    // Analisar o nome do arquivo
    console.log('\n=== ANÁLISE DO NOME DO ARQUIVO ===');
    console.log('Nome completo:', filename);
    
    const nameWithoutExt = filename.replace(/\.pdf$/i, '');
    console.log('Sem extensão:', nameWithoutExt);
    
    const parts = nameWithoutExt.split(' - ').map(p => p.trim());
    console.log('Partes (split por " - "):');
    parts.forEach((part, index) => {
      console.log(`  ${index}. "${part}"`);
    });
    
    // Buscar data no nome do arquivo
    const dateInFilename = /(\d{2})\.(\d{2})\.(\d{4})/;
    const dateMatch = nameWithoutExt.match(dateInFilename);
    
    if (dateMatch) {
      console.log(`\nData encontrada no nome: ${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]}`);
    } else {
      console.log('\nNenhuma data encontrada no nome do arquivo');
    }
    
    // Mostrar uma seção do texto ao redor de "Data(s) do evento"
    console.log('\n=== CONTEXTO DA DATA NO PDF ===');
    const contextStart = fullText.indexOf('Data(s) do evento');
    if (contextStart !== -1) {
      const context = fullText.substring(contextStart, contextStart + 200);
      console.log(context);
    }
    
  } catch (error) {
    console.error('\n=== ERRO ===');
    console.error(error);
  }
}

debugPDFContent();
