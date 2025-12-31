/**
 * Funções utilitárias para trabalhar com especialidades de técnicos
 */

/**
 * Converte uma string de especialidades separadas por vírgula em um array
 * @param especialidade - String com especialidades separadas por vírgula
 * @returns Array de especialidades
 */
export function parseEspecialidades(especialidade: string | undefined): string[] {
  if (!especialidade) return [];
  return especialidade
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0);
}

/**
 * Verifica se um técnico possui determinada especialidade
 * @param tecnicoEspecialidade - String de especialidades do técnico
 * @param especialidadeBuscada - Especialidade a ser buscada
 * @returns true se o técnico possui a especialidade
 */
export function hasEspecialidade(
  tecnicoEspecialidade: string | undefined,
  especialidadeBuscada: string
): boolean {
  if (!tecnicoEspecialidade) return false;
  const especialidades = parseEspecialidades(tecnicoEspecialidade);
  return especialidades.some(e => 
    e.toLowerCase() === especialidadeBuscada.toLowerCase()
  );
}

/**
 * Obtém lista única de todas as especialidades de um array de técnicos
 * @param tecnicos - Array de técnicos
 * @returns Array com especialidades únicas
 */
export function getAllEspecialidades(
  tecnicos: Array<{ especialidade?: string }>
): string[] {
  const allEspecialidades = new Set<string>();
  
  tecnicos.forEach(tec => {
    if (tec.especialidade) {
      const especialidades = parseEspecialidades(tec.especialidade);
      especialidades.forEach(e => allEspecialidades.add(e));
    }
  });
  
  return Array.from(allEspecialidades).sort();
}

/**
 * Renderiza especialidades como badges HTML
 * @param especialidade - String com especialidades separadas por vírgula
 * @returns String HTML com badges
 */
export function formatEspecialidadesAsBadges(especialidade: string | undefined): string {
  if (!especialidade) return '-';
  const especialidades = parseEspecialidades(especialidade);
  if (especialidades.length === 0) return '-';
  
  return especialidades
    .map(e => `<span class="especialidade-badge">${e}</span>`)
    .join(' ');
}
