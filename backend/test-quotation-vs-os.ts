import { PDFParser } from './src/parser/PDFParser';

async function testPDF(filePath: string, label: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${label}`);
  console.log('='.repeat(70));
  console.log(`Arquivo: ${filePath}\n`);
  
  try {
    const filename = filePath.split('/').pop() || filePath.split('\\').pop() || '';
    const result = await PDFParser.parsePDFFile(filePath, filename);
    
    console.log('✅ PDF ACEITO');
    console.log('Dados extraídos:');
    console.log('  - Número OS:', result.numeroOS);
    console.log('  - Cliente:', result.nomeCliente);
    console.log('  - Evento:', result.nomeEvento);
    console.log('  - Data:', result.data);
    
  } catch (error: any) {
    console.log('❌ PDF REJEITADO');
    console.log('Motivo:', error.message);
  }
}

(async () => {
  await testPDF(
    'C:/ServiceOrder/CLIENTES/BEATRIZ LINS/ORÇ. 12680 - BEATRIZ LINS - 30.12.pdf',
    '📋 TESTE 1: ORÇAMENTO (deve ser REJEITADO)'
  );
  
  await testPDF(
    'C:/ServiceOrder/CLIENTES/BEATRIZ LINS/O.S. -  12680 - BEATRIZ LINS - - 30.12.2025.pdf',
    '📝 TESTE 2: ORDEM DE SERVIÇO (deve ser ACEITA)'
  );
  
  console.log('\n' + '='.repeat(70));
  console.log('FIM DOS TESTES');
  console.log('='.repeat(70));
})();
