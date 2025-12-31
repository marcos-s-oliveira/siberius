/**
 * Teste de parsing do nome do arquivo de Beatriz Lins
 */

function testFilenameParsing() {
  const filename = 'O.S. -  12680 - BEATRIZ LINS - - 30.12.2025.pdf';
  
  console.log('=== ANÁLISE DO NOME DO ARQUIVO ===');
  console.log(`Nome: ${filename}\n`);
  
  const nameWithoutExt = filename.replace(/\.pdf$/i, '');
  console.log(`Sem extensão: "${nameWithoutExt}"\n`);
  
  // Extrair número da OS
  const numeroOSMatch = nameWithoutExt.match(/[^\d]*(\d+)/);
  console.log('Número da OS:');
  console.log(`  Match: ${numeroOSMatch ? numeroOSMatch[1] : 'NÃO ENCONTRADO'}`);
  
  // Dividir por " - "
  const parts = nameWithoutExt.split(' - ').map(p => p.trim());
  console.log(`\nPartes (split por " - "): ${parts.length} partes`);
  parts.forEach((part, index) => {
    console.log(`  [${index}]: "${part}" (length: ${part.length})`);
  });
  
  // Verificar se é marcador OS
  const isOSMarker = parts.length > 1 && /^O\.?S\.?$/i.test(parts[1]);
  console.log(`\nÉ marcador OS? ${isOSMarker} (parts[1] = "${parts[1]}")`);
  
  // Simular a lógica do parser
  console.log('\n=== LÓGICA DO PARSER ===');
  
  if (parts.length < 2) {
    console.log('❌ Formato incompleto (menos de 2 partes)');
    return;
  }
  
  let nomeCliente: string | null = null;
  let nomeEvento: string | null = null;
  let dataStr: string | null = null;
  
  if (isOSMarker) {
    console.log('Detectou marcador OS, usando lógica especial:');
    if (parts.length >= 5) {
      nomeCliente = parts[2];
      nomeEvento = parts.slice(3, parts.length - 1).join(' - ');
      dataStr = parts[parts.length - 1];
      
      console.log(`  Cliente: parts[2] = "${nomeCliente}"`);
      console.log(`  Evento: parts.slice(3, ${parts.length - 1}).join(' - ') = "${nomeEvento}"`);
      console.log(`  Data: parts[${parts.length - 1}] = "${dataStr}"`);
    } else {
      console.log(`  ⚠️  Formato incompleto após marcador OS (${parts.length} partes, necessário >= 5)`);
    }
  } else {
    console.log('Formato padrão:');
    if (parts.length >= 4) {
      nomeCliente = parts[1];
      nomeEvento = parts.slice(2, parts.length - 1).join(' - ');
      dataStr = parts[parts.length - 1];
      
      console.log(`  Cliente: parts[1] = "${nomeCliente}"`);
      console.log(`  Evento: parts.slice(2, ${parts.length - 1}).join(' - ') = "${nomeEvento}"`);
      console.log(`  Data: parts[${parts.length - 1}] = "${dataStr}"`);
    }
  }
  
  // Análise dos resultados
  console.log('\n=== RESULTADOS ===');
  console.log(`Cliente: "${nomeCliente}"`);
  console.log(`Evento: "${nomeEvento}"`);
  console.log(`Data: "${dataStr}"`);
  
  // Problemas identificados
  console.log('\n=== PROBLEMAS IDENTIFICADOS ===');
  if (nomeEvento === '') {
    console.log('❌ PROBLEMA: Nome do evento está VAZIO (string vazia)');
    console.log('   Causa: Dois hífens consecutivos no nome " - - "');
    console.log('   Isso pode causar falha na validação!');
  }
  
  if (nomeCliente && nomeCliente.length < 2) {
    console.log('❌ PROBLEMA: Nome do cliente muito curto');
  }
}

testFilenameParsing();
