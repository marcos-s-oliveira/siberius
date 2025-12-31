/**
 * Teste da validação de OS com gerador (contém valores em R$)
 */

function hasValidOSPattern(text: string): boolean {
  const osPattern = /Orçamento:\s*\d+.*?Campo\s+Grande/is;
  return osPattern.test(text);
}

function containsFinancialData(text: string): boolean {
  const normalizedText = text.toLowerCase();
  const hasValor = /\bvalor\b/i.test(normalizedText);
  const hasReais = /R\$|r\$|reais/i.test(text);
  return hasValor && hasReais;
}

console.log('=== TESTE DE OS COM GERADOR ===\n');

// Caso 1: OS válida com informações de gerador (DEVE SER ACEITA)
console.log('Teste 1: OS válida com valores de gerador');
const osComGerador = `
  Orçamento: 12680
  Campo Grande - MS
  A/C - Sr(ª). BEATRIZ LINS Tel: 123456
  Evento: Festa
  Data(s) do evento: 30/12/2025
  
  Política de Preços para o Gerador de 180 kVA
  Nosso gerador de 180 kVA possui duas tarifas distintas:
  1. Stand By: tarifa é de R$ 2.500,00
  2. Em Uso: tarifa é de R$ 3.000,00
  Além disso, caso o uso exceda 10 horas, será cobrada uma
  taxa adicional de R$ 350,00 por hora extra.
  O valor total será ajustado conforme o uso.
`;

const isValidOS1 = hasValidOSPattern(osComGerador);
const hasFinancial1 = containsFinancialData(osComGerador);

console.log(`  Tem padrão de OS válida? ${isValidOS1 ? '✓ SIM' : '✗ NÃO'}`);
console.log(`  Contém dados financeiros? ${hasFinancial1 ? '✓ SIM' : '✗ NÃO'}`);
console.log(`  Decisão: ${isValidOS1 ? '✅ ACEITAR (é OS válida)' : '❌ REJEITAR'}`);
console.log(`  Esperado: ✅ ACEITAR\n`);

// Caso 2: Orçamento real (NÃO é OS, tem valores - DEVE SER REJEITADO)
console.log('Teste 2: Orçamento detalhado (não é OS)');
const orcamento = `
  Orçamento para Evento
  Cliente: João Silva
  
  Valor Total: R$ 5.000,00
  Itens:
  - Som: R$ 2.000,00
  - Iluminação: R$ 3.000,00
`;

const isValidOS2 = hasValidOSPattern(orcamento);
const hasFinancial2 = containsFinancialData(orcamento);

console.log(`  Tem padrão de OS válida? ${isValidOS2 ? '✓ SIM' : '✗ NÃO'}`);
console.log(`  Contém dados financeiros? ${hasFinancial2 ? '✓ SIM' : '✗ NÃO'}`);
console.log(`  Decisão: ${isValidOS2 ? '✅ ACEITAR' : (hasFinancial2 ? '❌ REJEITAR (orçamento)' : '❓ AVALIAR')}`);
console.log(`  Esperado: ❌ REJEITAR\n`);

// Caso 3: OS válida sem valores financeiros (DEVE SER ACEITA)
console.log('Teste 3: OS válida normal (sem valores)');
const osNormal = `
  Orçamento: 9381
  Campo Grande - MS
  A/C - Sr(ª). ANDERSON RIBEIRO Tel: 123456
  Evento: Cortesia
  Data(s) do evento: 19/09/2025
`;

const isValidOS3 = hasValidOSPattern(osNormal);
const hasFinancial3 = containsFinancialData(osNormal);

console.log(`  Tem padrão de OS válida? ${isValidOS3 ? '✓ SIM' : '✗ NÃO'}`);
console.log(`  Contém dados financeiros? ${hasFinancial3 ? '✓ SIM' : '✗ NÃO'}`);
console.log(`  Decisão: ${isValidOS3 ? '✅ ACEITAR' : '❌ REJEITAR'}`);
console.log(`  Esperado: ✅ ACEITAR\n`);

// Caso 4: Documento sem padrão de OS e sem valores (AVALIAR OUTROS CRITÉRIOS)
console.log('Teste 4: Documento genérico (sem padrão de OS, sem valores)');
const documentoGenerico = `
  Documento interno
  Cliente: Maria Santos
  Evento: Reunião
  Data: 15/06/2025
`;

const isValidOS4 = hasValidOSPattern(documentoGenerico);
const hasFinancial4 = containsFinancialData(documentoGenerico);

console.log(`  Tem padrão de OS válida? ${isValidOS4 ? '✓ SIM' : '✗ NÃO'}`);
console.log(`  Contém dados financeiros? ${hasFinancial4 ? '✓ SIM' : '✗ NÃO'}`);
console.log(`  Decisão: ${isValidOS4 ? '✅ ACEITAR' : (hasFinancial4 ? '❌ REJEITAR' : '❓ AVALIAR (outros critérios)')}`);
console.log(`  Esperado: ❓ AVALIAR (depende de outros critérios)\n`);

console.log('✅ Testes concluídos!\n');
console.log('RESUMO DA LÓGICA:');
console.log('1. Se TEM padrão de OS válida → ACEITAR (mesmo com valores)');
console.log('2. Se NÃO TEM padrão de OS E TEM valores → REJEITAR (é orçamento)');
console.log('3. Se NÃO TEM padrão de OS E NÃO TEM valores → Avaliar outros critérios');
