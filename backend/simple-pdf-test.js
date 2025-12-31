const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

async function extractPDFText(pdfPath) {
  try {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= Math.min(3, pdf.numPages); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Erro:', error.message);
    return '';
  }
}

(async () => {
  console.log('='.repeat(80));
  console.log('ORÇAMENTO');
  console.log('='.repeat(80));
  const orcamento = await extractPDFText('C:/ServiceOrder/CLIENTES/BEATRIZ LINS/ORÇ. 12680 - BEATRIZ LINS - 30.12.pdf');
  console.log(orcamento.substring(0, 2000));
  
  console.log('\n\nPalavras-chave:');
  console.log('- "ORDEM DE SERVIÇO":', /ORDEM\s+DE\s+SERVIÇO/i.test(orcamento));
  console.log('- "ORÇAMENTO":', /ORÇAMENTO/i.test(orcamento));
  console.log('- "Validade":', /validade/i.test(orcamento));
  console.log('- "Condições de Pagamento":', /condições\s+de\s+pagamento/i.test(orcamento));
  
  console.log('\n\n' + '='.repeat(80));
  console.log('ORDEM DE SERVIÇO');
  console.log('='.repeat(80));
  const os = await extractPDFText('C:/ServiceOrder/CLIENTES/BEATRIZ LINS/O.S. - 12680 - BEATRIZ LINS - - 30.12.2025.pdf');
  console.log(os.substring(0, 2000));
  
  console.log('\n\nPalavras-chave:');
  console.log('- "ORDEM DE SERVIÇO":', /ORDEM\s+DE\s+SERVIÇO/i.test(os));
  console.log('- "ORÇAMENTO":', /ORÇAMENTO/i.test(os));
  console.log('- "Validade":', /validade/i.test(os));
  console.log('- "Condições de Pagamento":', /condições\s+de\s+pagamento/i.test(os));
})();
