import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractText(pdfPath: string) {
  const loadingTask = getDocument(pdfPath);
  const pdf = await loadingTask.promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

(async () => {
  try {
    console.log('===== ORÇAMENTO =====');
    const orcamento = await extractText('C:/ServiceOrder/CLIENTES/BEATRIZ LINS/ORÇ. 12680 - BEATRIZ LINS - 30.12.pdf');
    console.log('Primeiros 3000 caracteres:');
    console.log(orcamento.substring(0, 3000));
    console.log('\n\nPalavras-chave encontradas:');
    console.log('- ORÇAMENTO:', orcamento.includes('ORÇAMENTO') || orcamento.includes('Orçamento'));
    console.log('- ORDEM DE SERVIÇO:', orcamento.includes('ORDEM DE SERVIÇO') || orcamento.includes('Ordem de Serviço'));
    console.log('- Validade:', orcamento.includes('Validade') || orcamento.includes('validade'));
    console.log('- Aprovação:', orcamento.includes('Aprovação') || orcamento.includes('aprovação'));
    
    console.log('\n\n===== ORDEM DE SERVIÇO =====');
    const os = await extractText('C:/ServiceOrder/CLIENTES/BEATRIZ LINS/O.S. - 12680 - BEATRIZ LINS - - 30.12.2025.pdf');
    console.log('Primeiros 3000 caracteres:');
    console.log(os.substring(0, 3000));
    console.log('\n\nPalavras-chave encontradas:');
    console.log('- ORÇAMENTO:', os.includes('ORÇAMENTO') || os.includes('Orçamento'));
    console.log('- ORDEM DE SERVIÇO:', os.includes('ORDEM DE SERVIÇO') || os.includes('Ordem de Serviço'));
    console.log('- Validade:', os.includes('Validade') || os.includes('validade'));
    console.log('- Aprovação:', os.includes('Aprovação') || os.includes('aprovação'));
  } catch (error) {
    console.error('Erro:', error);
  }
})();
