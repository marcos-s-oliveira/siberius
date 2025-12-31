import * as fs from 'fs';
import * as path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Ler configuração
function getConfigPath(): string {
  const configContent = fs.readFileSync('config.conf', 'utf-8');
  const match = configContent.match(/PDF_DIRECTORY=(.+)/);
  if (!match) {
    throw new Error('PDF_DIRECTORY não encontrado no config.conf');
  }
  return match[1].trim();
}

// Buscar primeiro PDF no diretório
function findFirstPDF(directory: string): string | null {
  if (!fs.existsSync(directory)) {
    console.error(`❌ Diretório não existe: ${directory}`);
    return null;
  }

  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const found = findFirstPDF(fullPath);
      if (found) return found;
    } else if (file.toLowerCase().endsWith('.pdf')) {
      return fullPath;
    }
  }
  
  return null;
}

// Parse do conteúdo do PDF usando pdfjs-dist
async function parsePDFContent(filepath: string): Promise<void> {
  console.log('\n📄 Testando parse de PDF...');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`📂 Arquivo: ${path.basename(filepath)}`);
  console.log(`📍 Caminho: ${filepath}\n`);

  try {
    // Ler o arquivo PDF
    const dataBuffer = new Uint8Array(fs.readFileSync(filepath));
    console.log(`✅ Arquivo lido: ${dataBuffer.length} bytes`);
    
    // Fazer parse com pdfjs-dist
    console.log('🔄 Fazendo parse do PDF...\n');
    
    const loadingTask = pdfjsLib.getDocument({
      data: dataBuffer,
      useSystemFonts: true,
      standardFontDataUrl: undefined
    });
    
    const pdfDocument = await loadingTask.promise;
    console.log(`📝 PDF carregado com sucesso`);
    console.log(`📄 Páginas: ${pdfDocument.numPages}\n`);
    
    // Extrair texto de todas as páginas
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    console.log(`📝 Texto extraído: ${fullText.length} caracteres\n`);
    
    // Extrair informações específicas usando a NOVA ESTRATÉGIA DE DELIMITADORES
    console.log('🔍 Procurando informações (nova estratégia)...\n');
    
    const text = fullText;
    
    // 1. NÚMERO DA OS: entre 'Orçamento:' e 'Campo Grande'
    const osRegex = /Orçamento:\s*(\d+).*?Campo\s+Grande/is;
    const osMatch = text.match(osRegex);
    if (osMatch && osMatch[1]) {
      console.log(`✅ Número OS (entre 'Orçamento:' e 'Campo Grande'): ${osMatch[1]}`);
    } else {
      console.log('❌ Número OS NÃO encontrado - arquivo seria DESCARTADO');
    }
    
    // 2. NOME DO CLIENTE: entre 'A/C - Sr(ª).' e 'Tel:' OU entre 'Horário da desmontagem: HH:ii' e 'CPF:'
    let nomeCliente = null;
    
    const clienteRegex1 = /A\/C\s*-\s*Sr\(ª\)\.\s*(.+?)\s*Tel:/is;
    const clienteMatch1 = text.match(clienteRegex1);
    
    if (clienteMatch1 && clienteMatch1[1]?.trim()) {
      nomeCliente = clienteMatch1[1].trim().substring(0, 20);
      console.log(`✅ Cliente (entre 'A/C - Sr(ª).' e 'Tel:'): ${nomeCliente}`);
    } else {
      console.log(`❌ Cliente não encontrado (entre 'A/C - Sr(ª).' e 'Tel:')`);
      
      const clienteRegex2 = /Horário\s+da\s+desmontagem:\s*\d{2}:\d{2}\s*(.+?)\s*CPF:/is;
      const clienteMatch2 = text.match(clienteRegex2);
      
      if (clienteMatch2 && clienteMatch2[1]?.trim()) {
        nomeCliente = clienteMatch2[1].trim().substring(0, 20);
        console.log(`✅ Cliente (entre 'Horário da desmontagem:' e 'CPF:'): ${nomeCliente}`);
      } else {
        console.log(`❌ Cliente não encontrado (entre 'Horário da desmontagem:' e 'CPF:')`);
      }
    }
    
    // 3. NOME DO EVENTO: entre 'Evento:' e 'Data(s) do evento:'
    const eventoRegex = /Evento:\s*(.+?)\s*Data\(s\)\s+do\s+evento:/is;
    const eventoMatch = text.match(eventoRegex);
    
    if (eventoMatch && eventoMatch[1]?.trim()) {
      console.log(`✅ Evento (entre 'Evento:' e 'Data(s) do evento:'): ${eventoMatch[1].trim()}`);
    } else {
      console.log(`❌ Evento não encontrado (entre 'Evento:' e 'Data(s) do evento:')`);
    }
    
    // 4. DATA DO EVENTO: entre 'Data(s) do evento:' e 'Horário de início do evento:'
    const dataRegex = /Data\(s\)\s+do\s+evento:\s*(.+?)\s*Horário\s+de\s+início\s+do\s+evento:/is;
    const dataMatch = text.match(dataRegex);
    
    if (dataMatch && dataMatch[1]?.trim()) {
      const dataStr = dataMatch[1].trim();
      const datePattern = /(\d{2}\/\d{2}\/\d{4})/;
      const dateExtract = dataStr.match(datePattern);
      
      if (dateExtract) {
        console.log(`✅ Data do Evento (entre 'Data(s) do evento:' e 'Horário de início:'): ${dateExtract[1]}`);
      } else {
        console.log(`⚠️  Data encontrada mas sem formato DD/MM/YYYY: ${dataStr}`);
      }
    } else {
      console.log(`❌ Data do Evento não encontrada (entre 'Data(s) do evento:' e 'Horário de início:')`);
    }
    
    // RESULTADO FINAL
    console.log('\n═══════════════════════════════════════════════════════');
    if (!osMatch) {
      console.log('🚫 ARQUIVO SERIA DESCARTADO (sem número da OS)');
    } else if (!nomeCliente && !eventoMatch && !dataMatch) {
      console.log('⚠️  SALVO COM DATA 01/01/1990 e ativa:false (apenas numeroOS)');
    } else {
      console.log('✅ ARQUIVO SERIA SALVO NORMALMENTE');
    }
    console.log('═══════════════════════════════════════════════════════')
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 RESUMO DO TEXTO (primeiras 500 caracteres):\n');
    console.log(text.substring(0, 500));
    console.log('\n═══════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('\n❌ Erro ao fazer parse do PDF:');
    console.error(error);
  }
}

// Main
async function main() {
  try {
    console.log('🚀 Iniciando teste de PDF Parse...\n');
    
    // Ler caminho do config
    const pdfDirectory = getConfigPath();
    console.log(`📂 Diretório configurado: ${pdfDirectory}\n`);
    
    // Buscar primeiro PDF
    console.log('🔍 Procurando primeiro arquivo PDF...');
    const pdfPath = findFirstPDF(pdfDirectory);
    
    if (!pdfPath) {
      console.error('\n❌ Nenhum arquivo PDF encontrado no diretório configurado.');
      process.exit(1);
    }
    
    // Parse do PDF
    await parsePDFContent(pdfPath);
    
    console.log('\n✅ Teste concluído!\n');
    
  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  }
}

main();
