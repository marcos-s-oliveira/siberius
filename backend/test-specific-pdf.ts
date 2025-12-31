import { PDFParser } from './src/parser/PDFParser';
import * as path from 'path';

async function testSpecificPDF() {
  const filepath = 'C:/serviceOrder/CLIENTES/ANDERSON RIBEIRO/O.S. - 9381 - ANDERSON RIBEIRO - CORTESIA.pdf';
  const filename = path.basename(filepath);
  
  console.log('=== TESTE DE PDF ESPECÍFICO ===');
  console.log(`Arquivo: ${filename}`);
  console.log(`Caminho: ${filepath}`);
  console.log('');
  
  try {
    // Processar o PDF
    const result = await PDFParser.parsePDFFile(filepath, filename);
    
    console.log('\n=== RESULTADO DO PARSE ===');
    console.log('NumeroOS:', result.numeroOS);
    console.log('Cliente:', result.nomeCliente);
    console.log('Evento:', result.nomeEvento);
    console.log('Data:', result.data);
    console.log('Data formatada:', result.data.toLocaleDateString('pt-BR'));
    console.log('OS Atualizada:', result.osAtualizada);
    
  } catch (error) {
    console.error('\n=== ERRO NO PARSE ===');
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error(error);
    }
  }
}

testSpecificPDF();
