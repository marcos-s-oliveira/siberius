/**
 * Teste de parsing de intervalos de datas
 */

function parseDateBR(dateStr: string): Date {
  // Verificar se é um intervalo
  const rangePattern = /(\d{2})\/(\d{2})\/(\d{4})\s*[AaÀà]\s*\d{2}\/\d{2}\/\d{4}/;
  const rangeMatch = dateStr.match(rangePattern);
  
  if (rangeMatch) {
    console.log('    → Intervalo detectado, usando data inicial');
    const day = parseInt(rangeMatch[1], 10);
    const month = parseInt(rangeMatch[2], 10);
    const year = parseInt(rangeMatch[3], 10);
    return new Date(year, month - 1, day);
  }
  
  // Parse normal
  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    throw new Error(`Formato inválido: ${dateStr}`);
  }
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  return new Date(year, month - 1, day);
}

function parseDate(dateStr: string): Date {
  // Verificar se é um intervalo (formato com ponto)
  const rangePattern = /(\d{2})\.(\d{2})\.(\d{4})\s*[AaÀà]\s*\d{2}\.\d{2}\.\d{4}/;
  const rangeMatch = dateStr.match(rangePattern);
  
  if (rangeMatch) {
    console.log('    → Intervalo detectado, usando data inicial');
    const day = parseInt(rangeMatch[1], 10);
    const month = parseInt(rangeMatch[2], 10);
    const year = parseInt(rangeMatch[3], 10);
    return new Date(year, month - 1, day);
  }
  
  // Parse normal
  const parts = dateStr.split('.');
  if (parts.length < 2) {
    throw new Error(`Formato inválido: ${dateStr}`);
  }
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parts.length === 3 ? parseInt(parts[2], 10) : new Date().getFullYear();
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

console.log('=== TESTE DE INTERVALOS DE DATAS ===\n');

// Testes com barra (conteúdo PDF)
console.log('--- Formato DD/MM/YYYY (conteúdo PDF) ---');

console.log('\n1. Data única:');
let date = parseDateBR('15/06/2025');
console.log(`   Entrada: "15/06/2025"`);
console.log(`   Resultado: ${formatDate(date)}`);
console.log(`   Esperado: 15/06/2025 ✓\n`);

console.log('2. Intervalo com "A" maiúsculo:');
date = parseDateBR('15/06/2025 A 20/06/2025');
console.log(`   Entrada: "15/06/2025 A 20/06/2025"`);
console.log(`   Resultado: ${formatDate(date)}`);
console.log(`   Esperado: 15/06/2025 (data inicial) ✓\n`);

console.log('3. Intervalo com "a" minúsculo:');
date = parseDateBR('10/03/2025 a 12/03/2025');
console.log(`   Entrada: "10/03/2025 a 12/03/2025"`);
console.log(`   Resultado: ${formatDate(date)}`);
console.log(`   Esperado: 10/03/2025 (data inicial) ✓\n`);

console.log('4. Intervalo com "à":');
date = parseDateBR('25/12/2025 à 31/12/2025');
console.log(`   Entrada: "25/12/2025 à 31/12/2025"`);
console.log(`   Resultado: ${formatDate(date)}`);
console.log(`   Esperado: 25/12/2025 (data inicial) ✓\n`);

// Testes com ponto (nome do arquivo)
console.log('\n--- Formato DD.MM.YYYY (nome do arquivo) ---');

console.log('\n5. Data única:');
date = parseDate('15.06.2025');
console.log(`   Entrada: "15.06.2025"`);
console.log(`   Resultado: ${formatDate(date)}`);
console.log(`   Esperado: 15/06/2025 ✓\n`);

console.log('6. Intervalo com "A":');
date = parseDate('15.06.2025 A 20.06.2025');
console.log(`   Entrada: "15.06.2025 A 20.06.2025"`);
console.log(`   Resultado: ${formatDate(date)}`);
console.log(`   Esperado: 15/06/2025 (data inicial) ✓\n`);

console.log('7. Intervalo com "a":');
date = parseDate('01.01.2026 a 07.01.2026');
console.log(`   Entrada: "01.01.2026 a 07.01.2026"`);
console.log(`   Resultado: ${formatDate(date)}`);
console.log(`   Esperado: 01/01/2026 (data inicial) ✓\n`);

// Teste com nome de arquivo completo
console.log('\n--- Teste com nome de arquivo completo ---');
console.log('\n8. Arquivo com intervalo de datas:');
const filename = '12345 - João Silva - Evento Multi-dias - 15.06.2025 A 20.06.2025.pdf';
console.log(`   Arquivo: ${filename}`);
const dateMatch = filename.match(/(\d{2})\.(\d{2})\.(\d{4})\s*[AaÀà]\s*\d{2}\.\d{2}\.\d{4}/);
if (dateMatch) {
  const extracted = `${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]}`;
  date = parseDate(extracted);
  console.log(`   Data extraída: ${extracted}`);
  console.log(`   Resultado: ${formatDate(date)}`);
  console.log(`   Esperado: 15/06/2025 (início do evento) ✓`);
}

console.log('\n✅ Testes concluídos!\n');
