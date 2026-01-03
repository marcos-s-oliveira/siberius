module.exports = {
  apps: [
    {
      name: 'siberius-api',
      script: 'dist/api-only.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        API_PORT: 3000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'siberius-scan',
      script: 'dist/scan-once.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: false, // NÃO reiniciar automaticamente
      watch: false,
      cron_restart: '*/10 * * * *', // Executar a cada 10 minutos
      env: {
        NODE_ENV: 'production',
        VERBOSE_LOGGING: true
      },
      error_file: './logs/scan-error.log',
      out_file: './logs/scan-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
