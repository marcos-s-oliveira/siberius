/**
 * Teste do parser de nomes de arquivo após correções
 */

// Simular a lógica de parsing corrigida
function testFilenameParser(filename: string) {
  console.log(`\n📄 Testando: ${filename}`);
  
  const nameWithoutExt = filename.replace(/\.pdf$/i, '');
  const parts = nameWithoutExt.split(' - ').map(p => p.trim());
  
  console.log(`   Parts (${parts.length}):`, parts);
  
  const numeroOSMatch = nameWithoutExt.match(/[^\d]*(\d+)/);
  const numeroOS = numeroOSMatch ? numeroOSMatch[1] : 'N/A';
  
  // Identificar se parts[1] é um marcador "O.S", "OS", "OS." que deve ser ignorado
  const isOSMarker = parts.length > 1 && /^O\.?S\.?$/i.test(parts[1]);
  
  console.log(`   É marcador OS? ${isOSMarker} (parts[1] = "${parts[1]}")`);
  
  let nomeCliente = 'N/A';
  let nomeEvento = 'N/A';
  let dataStr = 'N/A';
  
  if (isOSMarker && parts.length >= 5) {
    nomeCliente = parts[2];
    nomeEvento = parts.slice(3, parts.length - 1).join(' - ');
    dataStr = parts[parts.length - 1];
  } else if (parts.length >= 4) {
    nomeCliente = parts[1];
    nomeEvento = parts.slice(2, parts.length - 1).join(' - ');
    dataStr = parts[parts.length - 1];
  }
  
  console.log(`   ✓ NumeroOS: ${numeroOS}`);
  console.log(`   ✓ Cliente: ${nomeCliente}`);
  console.log(`   ✓ Evento: ${nomeEvento}`);
  console.log(`   ✓ Data: ${dataStr}`);
}

// Casos de teste
console.log('=== TESTES DE PARSING DE NOMES DE ARQUIVO ===');

// Caso problemático do log
testFilenameParser('11857 - OS. - 8020 - SOM, PAINEL E TENDA - EVENTO CASA E COR - 09.10.2025.pdf');

// Outros casos
testFilenameParser('12345 - João Silva - Casamento - 15.06.2025.pdf');
testFilenameParser('8020 - O.S - Cliente XYZ - Evento ABC - Parte 2 - 10.12.2025.pdf');
testFilenameParser('9999 - OS - Maria Santos - Aniversário - 01.01.2026.pdf');

console.log('\n✅ Testes concluídos!\n');
