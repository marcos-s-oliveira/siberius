/**
 * Utilitário de logging com timestamp
 */

function getTimestamp(): string {
  const now = new Date();
  return now.toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

export const logger = {
  log: (...args: any[]) => {
    console.log(`[${getTimestamp()}]`, ...args);
  },

  error: (...args: any[]) => {
    console.error(`[${getTimestamp()}]`, ...args);
  },

  warn: (...args: any[]) => {
    console.warn(`[${getTimestamp()}]`, ...args);
  },

  info: (...args: any[]) => {
    console.info(`[${getTimestamp()}]`, ...args);
  }
};
