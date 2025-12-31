/// <reference types="vite/client" />

// Tipagem para configuração global
interface SiberiusConfig {
  API_URL: string;
  API_TIMEOUT: number;
  DEBUG?: boolean;
}

interface Window {
  SIBERIUS_CONFIG?: SiberiusConfig;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
