import { PDFParser } from './src/parser/PDFParser';
import * as fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as path from 'path';

async function testBeatrizLins() {
  const filepath = 'C:/ServiceOrder/CLIENTES/BEATRIZ LINS/O.S. -  12680 - BEATRIZ LINS - - 30.12.2025.pdf';
  const filename = path.basename(filepath);
  
  console.log('=== ANÁLISE DETALHADA DO ARQUIVO ===');
  console.log(`Arquivo: ${filename}`);
  console.log(`Caminho: ${filepath}\n`);
  
  // Verificar se arquivo existe
  if (!fs.existsSync(filepath)) {
    console.error('❌ ARQUIVO NÃO ENCONTRADO');
    return;
  }
  
  console.log('✓ Arquivo existe');
  const stats = fs.statSync(filepath);
  console.log(`✓ Tamanho: ${stats.size} bytes\n`);
  
  try {
    // 1. Extrair e mostrar conteúdo do PDF
    console.log('--- EXTRAÇÃO DO CONTEÚDO ---');
    const dataBuffer = new Uint8Array(fs.readFileSync(filepath));
    
    const loadingTask = pdfjsLib.getDocument({
      data: dataBuffer,
      useSystemFonts: true,
      standardFontDataUrl: undefined
    });
    
    const pdfDocument = await loadingTask.promise;
    console.log(`Páginas: ${pdfDocument.numPages}`);
    
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    console.log(`Texto extraído: ${fullText.length} caracteres\n`);
    
    // 2. Verificar validação financeira
    console.log('--- VALIDAÇÃO FINANCEIRA ---');
    const hasValor = /\bvalor\b/i.test(fullText.toLowerCase());
    const hasReais = /R\$|r\$|reais/i.test(fullText);
    
    console.log(`Contém "valor": ${hasValor}`);
    console.log(`Contém "R$" ou "reais": ${hasReais}`);
    
    if (hasValor && hasReais) {
      console.log('⚠️  ARQUIVO SERIA DESCARTADO: Contém informações financeiras\n');
      
      // Mostrar trechos com "valor" e "R$"
      const lines = fullText.split('\n');
      console.log('Linhas com "valor":');
      lines.forEach((line, i) => {
        if (/\bvalor\b/i.test(line)) {
          console.log(`  Linha ${i}: ${line.substring(0, 100)}`);
        }
      });
      
      console.log('\nLinhas com "R$":');
      lines.forEach((line, i) => {
        if (/R\$/i.test(line)) {
          console.log(`  Linha ${i}: ${line.substring(0, 100)}`);
        }
      });
      
      console.log('\n❌ MOTIVO: PDF contém "valor" E "R$" - considerado documento financeiro\n');
    } else {
      console.log('✓ Passou na validação financeira\n');
    }
    
    // 3. Buscar informações específicas
    console.log('--- BUSCA DE INFORMAÇÕES ---');
    
    // Número da OS
    const osRegex = /Orçamento:\s*(\d+).*?Campo\s+Grande/is;
    const osMatch = fullText.match(osRegex);
    console.log(`Número da OS: ${osMatch ? osMatch[1] : 'NÃO ENCONTRADO'}`);
    
    // Nome do cliente
    const clienteRegex1 = /A\/C\s*-\s*Sr\(ª\)\.\s*(.+?)\s*Tel:/is;
    const clienteMatch = fullText.match(clienteRegex1);
    console.log(`Nome do cliente: ${clienteMatch ? clienteMatch[1].substring(0, 50) : 'NÃO ENCONTRADO'}`);
    
    // Data do evento
    const dataRegex = /Data\(s\)\s+do\s+evento:\s*(.+?)\s*Horário\s+de\s+início/is;
    const dataMatch = fullText.match(dataRegex);
    console.log(`Data do evento: ${dataMatch ? dataMatch[1].substring(0, 50) : 'NÃO ENCONTRADO'}`);
    
    console.log('\n--- TENTANDO PROCESSAR COM PDFPARSER ---\n');
    
    // 4. Tentar processar com PDFParser
    const result = await PDFParser.parsePDFFile(filepath, filename);
    
    console.log('\n=== RESULTADO ===');
    console.log('✅ ARQUIVO ACEITO');
    console.log('NumeroOS:', result.numeroOS);
    console.log('Cliente:', result.nomeCliente);
    console.log('Evento:', result.nomeEvento);
    console.log('Data:', result.data.toLocaleDateString('pt-BR'));
    console.log('OS Atualizada:', result.osAtualizada);
    
  } catch (error) {
    console.error('\n=== ERRO NO PROCESSAMENTO ===');
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      
      // Analisar o tipo de erro
      if (error.message.includes('valor') && error.message.includes('R$')) {
        console.error('\n❌ MOTIVO DA REJEIÇÃO: Arquivo contém informações financeiras');
      } else if (error.message.includes('Número da OS não encontrado')) {
        console.error('\n❌ MOTIVO DA REJEIÇÃO: Número da OS não encontrado no formato esperado');
      } else if (error.message.includes('Score de confiabilidade')) {
        console.error('\n❌ MOTIVO DA REJEIÇÃO: Score de validação muito baixo');
      } else if (error.message.includes('INCONSISTÊNCIA')) {
        console.error('\n❌ MOTIVO DA REJEIÇÃO: Número da OS inconsistente entre conteúdo e nome');
      }
    } else {
      console.error(error);
    }
  }
}

testBeatrizLins();
