import PDFParser from './src/parser/PDFParser';
import * as fs from 'fs';

async function analyzePDF(filePath: string, label: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${label}: ${filePath}`);
  console.log('='.repeat(60));
  
  try {
    const data = await fs.promises.readFile(filePath);
    const parser = new PDFParser();
    const result = await (parser as any).parseContentText(data);
    
    console.log('\n📊 Resultado da Validação:');
    console.log('Score:', result.score);
    console.log('Valid:', result.valid);
    console.log('Errors:', result.errors);
    console.log('Warnings:', result.warnings);
    
    if (result.data) {
      console.log('\n📝 Dados Extraídos:');
      console.log('numeroOS:', result.data.numeroOS);
      console.log('cliente:', result.data.cliente);
      console.log('evento:', result.data.evento);
      console.log('data:', result.data.data);
    }
    
    // Analisar conteúdo textual
    const { getDocument } = require('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = getDocument(new Uint8Array(data));
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= Math.min(pdf.numPages, 2); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + ' ';
    }
    
    console.log('\n🔍 Análise de Conteúdo:');
    console.log('Contém "ORÇAMENTO":', /ORÇAMENTO/i.test(fullText));
    console.log('Contém "ORDEM DE SERVIÇO":', /ORDEM\s+DE\s+SERVIÇO/i.test(fullText));
    console.log('Contém "Validade":', /validade/i.test(fullText));
    console.log('Contém "Aprovação":', /aprovação|aprovaç/i.test(fullText));
    console.log('Contém "Condições":', /condições|condiç/i.test(fullText));
    console.log('Contém "Prazo de Pagamento":', /prazo\s+de\s+pagamento/i.test(fullText));
    
    console.log('\n📄 Primeiros 500 caracteres do texto:');
    console.log(fullText.substring(0, 500));
    
    return { result, fullText };
  } catch (error) {
    console.error('❌ Erro ao processar:', error);
  }
}

(async () => {
  const orcamento = await analyzePDF(
    'C:/ServiceOrder/CLIENTES/BEATRIZ LINS/ORÇ. 12680 - BEATRIZ LINS - 30.12.pdf',
    '📋 ORÇAMENTO'
  );
  
  const os = await analyzePDF(
    'C:/ServiceOrder/CLIENTES/BEATRIZ LINS/O.S. - 12680 - BEATRIZ LINS - - 30.12.2025.pdf',
    '📝 ORDEM DE SERVIÇO'
  );
  
  console.log('\n\n' + '='.repeat(60));
  console.log('🎯 RESUMO COMPARATIVO');
  console.log('='.repeat(60));
  
  if (orcamento && os) {
    console.log('\nDiferenças detectadas:');
    console.log('- Parser considerou ORÇAMENTO válido?', orcamento.result.valid);
    console.log('- Parser considerou OS válida?', os.result.valid);
  }
})();
