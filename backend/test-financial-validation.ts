/**
 * Teste de validação de dados financeiros
 */

function containsFinancialData(text: string): boolean {
  const normalizedText = text.toLowerCase();
  
  const hasValor = /\bvalor\b/i.test(normalizedText);
  const hasReais = /R\$|r\$|reais/i.test(text);
  
  if (hasValor && hasReais) {
    console.warn('    ⚠️  Detectado: "valor" E "R$" no conteúdo');
    return true;
  }
  
  return false;
}

console.log('=== TESTE DE VALIDAÇÃO FINANCEIRA ===\n');

// Caso 1: PDF com valores financeiros (DEVE SER DESCARTADO)
console.log('Teste 1: PDF com valores financeiros');
const texto1 = `
  Orçamento: 12345
  Campo Grande - MS
  Cliente: João Silva
  Evento: Casamento
  Valor Total: R$ 5.000,00
  Itens:
  - Som: R$ 2.000,00
  - Iluminação: R$ 3.000,00
`;
console.log(`Resultado: ${containsFinancialData(texto1) ? '❌ DESCARTADO' : '✅ ACEITO'}`);
console.log(`Esperado: ❌ DESCARTADO\n`);

// Caso 2: PDF com "valor" mas sem R$ (DEVE SER ACEITO)
console.log('Teste 2: PDF com palavra "valor" mas sem R$');
const texto2 = `
  Orçamento: 12345
  Campo Grande - MS
  Este evento tem grande valor sentimental para a família.
`;
console.log(`Resultado: ${containsFinancialData(texto2) ? '❌ DESCARTADO' : '✅ ACEITO'}`);
console.log(`Esperado: ✅ ACEITO\n`);

// Caso 3: PDF com R$ mas sem "valor" (DEVE SER ACEITO)
console.log('Teste 3: PDF com R$ mas sem palavra "valor"');
const texto3 = `
  Orçamento: 12345
  Campo Grande - MS
  Equipamentos da marca R$ound Systems
`;
console.log(`Resultado: ${containsFinancialData(texto3) ? '❌ DESCARTADO' : '✅ ACEITO'}`);
console.log(`Esperado: ✅ ACEITO\n`);

// Caso 4: PDF normal de OS (DEVE SER ACEITO)
console.log('Teste 4: PDF normal de Ordem de Serviço');
const texto4 = `
  Orçamento: 12345
  Campo Grande - MS
  A/C - Sr(ª). João Silva Tel: 123456
  Evento: Casamento
  Data(s) do evento: 15/06/2025
  Horário de início do evento: 18:00
`;
console.log(`Resultado: ${containsFinancialData(texto4) ? '❌ DESCARTADO' : '✅ ACEITO'}`);
console.log(`Esperado: ✅ ACEITO\n`);

// Caso 5: PDF com "reais" por extenso (DEVE SER DESCARTADO)
console.log('Teste 5: PDF com valor por extenso');
const texto5 = `
  Orçamento: 12345
  Campo Grande - MS
  Valor total: cinco mil reais
`;
console.log(`Resultado: ${containsFinancialData(texto5) ? '❌ DESCARTADO' : '✅ ACEITO'}`);
console.log(`Esperado: ❌ DESCARTADO\n`);

console.log('✅ Testes concluídos!\n');
