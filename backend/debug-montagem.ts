import * as fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function debugPDF(filepath: string) {
  console.log('📄 Analisando PDF:', filepath);
  
  const dataBuffer = new Uint8Array(fs.readFileSync(filepath));
  
  const pdfDocument = await pdfjsLib.getDocument({
    data: dataBuffer,
    useSystemFonts: true,
    standardFontDataUrl: undefined
  }).promise;

  const numPages = pdfDocument.numPages;
  let fullText = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + ' ';
  }

  // Limpar texto
  const cleanText = fullText.replace(/\s+/g, ' ').trim();
  
  console.log('\n📝 Texto completo (primeiros 2000 caracteres):');
  console.log(cleanText.substring(0, 2000));
  console.log('\n...\n');
  
  // Buscar padrões de montagem
  console.log('\n🔍 Buscando padrões de Data da Montagem:');
  const patterns = [
    /Data\(s\)\s+da\s+montagem:\s*(.+?)\s*Horário\s+da\s+montagem:/is,
    /Data\(s\)\s*da\s*montagem:\s*(.+?)\s*Horário/is,
    /Data.*montagem.*?(\d{2}\/\d{2}\/\d{4})/is,
    /montagem:\s*(\d{2}\/\d{2}\/\d{4})/is,
  ];
  
  patterns.forEach((pattern, i) => {
    const match = cleanText.match(pattern);
    console.log(`  Padrão ${i + 1}: ${match ? '✅ ' + match[1] : '❌ Não encontrado'}`);
  });
  
  console.log('\n🔍 Buscando padrões de Horário da Montagem:');
  const horarioPatterns = [
    /Horário\s+da\s+montagem:\s*(\d{1,2}:\d{2})/is,
    /Horário\s*da\s*montagem:\s*(\d{1,2}:\d{2})/is,
    /montagem:\s*(\d{1,2}:\d{2})/is,
  ];
  
  horarioPatterns.forEach((pattern, i) => {
    const match = cleanText.match(pattern);
    console.log(`  Padrão ${i + 1}: ${match ? '✅ ' + match[1] : '❌ Não encontrado'}`);
  });
  
  // Mostrar contexto ao redor de "montagem"
  console.log('\n📍 Contexto ao redor de "montagem":');
  const montagemIndex = cleanText.toLowerCase().indexOf('montagem');
  if (montagemIndex > -1) {
    const start = Math.max(0, montagemIndex - 100);
    const end = Math.min(cleanText.length, montagemIndex + 200);
    console.log(cleanText.substring(start, end));
  } else {
    console.log('  ❌ Palavra "montagem" não encontrada no PDF');
  }
}

// Pegar o caminho do PDF do argumento da linha de comando
const pdfPath = process.argv[2];

if (!pdfPath) {
  console.error('❌ Uso: tsx debug-montagem.ts <caminho-do-pdf>');
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
  console.error('❌ Arquivo não encontrado:', pdfPath);
  process.exit(1);
}

debugPDF(pdfPath).catch(console.error);
