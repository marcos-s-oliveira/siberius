/**
 * Garante que uma operação assíncrona demore pelo menos um tempo mínimo
 * Útil para exibir animações de loading mesmo quando a operação é muito rápida
 * 
 * @param promise - A promise da operação a ser executada
 * @param minDelay - Tempo mínimo em milissegundos (padrão: 600ms)
 * @returns Promise com o resultado da operação original
 */
export async function withMinDelay<T>(
  promise: Promise<T>,
  minDelay: number = 600
): Promise<T> {
  const startTime = Date.now();
  const result = await promise;
  const elapsed = Date.now() - startTime;
  
  if (elapsed < minDelay) {
    await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
  }
  
  return result;
}
