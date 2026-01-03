#!/usr/bin/env node

/**
 * Instalador Siberius - Download do GitHub e Build Local
 * Execute: node install.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuração do repositório GitHub
const GITHUB_REPO = 'https://github.com/marcos-s-oliveira/siberius.git'; // TODO: Atualizar com seu repositório
const INSTALL_DIR = process.cwd();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Cores no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function header(text) {
  console.log('\n' + '='.repeat(60));
  log(`  ${text}`, 'bright');
  console.log('='.repeat(60) + '\n');
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(colors.cyan + prompt + colors.reset, resolve);
  });
}

function execCommand(command, description) {
  log(`⏳ ${description}...`, 'yellow');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} - Concluído!`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - Falhou!`, 'red');
    return false;
  }
}

async function main() {
  console.clear();
  
  log('╔═══════════════════════════════════════════════════════════╗', 'bright');
  log('║                                                           ║', 'bright');
  log('║          🚀  INSTALADOR SIBERIUS v1.0                    ║', 'cyan');
  log('║                                                           ║', 'bright');
  log('║          Sistema de Gestão de Ordens de Serviço         ║', 'bright');
  log('║                                                           ║', 'bright');
  log('╚═══════════════════════════════════════════════════════════╝', 'bright');
  console.log('');

  // Verificar pré-requisitos
  header('VERIFICANDO PRÉ-REQUISITOS');
  
  log('🔍 Verificando Node.js...', 'yellow');
  try {
    const nodeVersion = execSync('node -v').toString().trim();
    log(`✅ Node.js ${nodeVersion} encontrado`, 'green');
  } catch {
    log('❌ Node.js não encontrado! Instale em: https://nodejs.org', 'red');
    process.exit(1);
  }

  log('🔍 Verificando npm...', 'yellow');
  try {
    const npmVersion = execSync('npm -v').toString().trim();
    log(`✅ npm ${npmVersion} encontrado`, 'green');
  } catch {
    log('❌ npm não encontrado!', 'red');
    process.exit(1);
  }

  log('🔍 Verificando Git...', 'yellow');
  try {
    const gitVersion = execSync('git --version').toString().trim();
    log(`✅ Git ${gitVersion} encontrado`, 'green');
  } catch {
    log('❌ Git não encontrado! Instale em: https://git-scm.com', 'red');
    process.exit(1);
  }

  log('🔍 Verificando PostgreSQL...', 'yellow');
  try {
    execSync('psql --version', { stdio: 'pipe' });
    log('✅ PostgreSQL encontrado', 'green');
  } catch {
    log('⚠️  PostgreSQL não encontrado (será necessário instalar)', 'yellow');
  }

  // Coletar informações
  header('CONFIGURAÇÃO');

  const installPath = await question(`📁 Pasta de instalação [${INSTALL_DIR}/siberius]: `) || path.join(INSTALL_DIR, 'siberius');
  
  const config = {
    installPath,
    backendPort: await question('🔌 Porta do Backend [3000]: ') || '3000',
    frontendPort: await question('🌐 Porta do Frontend [5173]: ') || '5173',
    dbHost: await question('🗄️  PostgreSQL Host [localhost]: ') || 'localhost',
    dbPort: await question('🗄️  PostgreSQL Porta [5432]: ') || '5432',
    dbUser: await question('👤 PostgreSQL Usuário [postgres]: ') || 'postgres',
    dbPassword: await question('🔑 PostgreSQL Senha: '),
    dbName: await question('📊 Nome do Banco [siberius]: ') || 'siberius',
    pdfDirectory: await question('📁 Diretório dos PDFs [C:\\ServiceOrder]: ') || 'C:\\ServiceOrder',
    jwtSecret: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
  };

  // Confirmar
  console.log('');
  log('📋 RESUMO DA CONFIGURAÇÃO:', 'bright');
  console.log('');
  console.log(`  Pasta:          ${config.installPath}`);
  console.log(`  Backend:        http://localhost:${config.backendPort}`);
  console.log(`  Frontend:       http://localhost:${config.frontendPort}`);
  console.log(`  Banco de Dados: postgresql://${config.dbUser}@${config.dbHost}:${config.dbPort}/${config.dbName}`);
  console.log(`  PDFs:           ${config.pdfDirectory}`);
  console.log('');

  const confirm = await question('Continuar com a instalação? (s/n): ');
  if (confirm.toLowerCase() !== 's') {
    log('❌ Instalação cancelada.', 'red');
    process.exit(0);
  }

  // Download do GitHub
  header('BAIXANDO DO GITHUB');
  
  if (fs.existsSync(config.installPath)) {
    const overwrite = await question(`⚠️  Pasta ${config.installPath} já existe. Sobrescrever? (s/n): `);
    if (overwrite.toLowerCase() !== 's') {
      log('❌ Instalação cancelada.', 'red');
      process.exit(0);
    }
    log('🗑️  Removendo pasta existente...', 'yellow');
    fs.rmSync(config.installPath, { recursive: true, force: true });
  }

  log(`📦 Clonando repositório de ${GITHUB_REPO}...`, 'yellow');
  try {
    execSync(`git clone ${GITHUB_REPO} "${config.installPath}"`, { stdio: 'inherit' });
    log('✅ Código baixado com sucesso!', 'green');
  } catch (error) {
    log('❌ Erro ao clonar repositório!', 'red');
    log('Verifique se o repositório existe e está acessível.', 'yellow');
    process.exit(1);
  }

  // Remover pasta .git (não é necessária após clone)
  log('🧹 Limpando arquivos de desenvolvimento...', 'yellow');
  const gitDir = path.join(config.installPath, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }

  // Instalar Backend
  header('INSTALANDO BACKEND');
  
  const backendDir = path.join(config.installPath, 'backend');
  process.chdir(backendDir);
  
  if (!execCommand('npm install', 'Instalando dependências do backend')) {
    process.exit(1);
  }

  // Criar .env
  log('⚙️  Criando arquivo .env...', 'yellow');
  const envContent = `# Siberius Backend Configuration
PORT=${config.backendPort}
NODE_ENV=production

# Database
DATABASE_URL="postgresql://${config.dbUser}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}?schema=public"

# Security
JWT_SECRET="${config.jwtSecret}"
JWT_EXPIRES_IN=12h

# PDF Scanner
PDF_DIRECTORY="${config.pdfDirectory}"
CHECK_INTERVAL_MINUTES=10
VERBOSE_LOGGING=true
`;

  fs.writeFileSync(path.join(backendDir, '.env'), envContent);
  log('✅ Arquivo .env criado!', 'green');

  // Rodar migrations
  if (!execCommand('npx prisma migrate deploy', 'Aplicando migrations do banco de dados')) {
    log('⚠️  Migrations falharam. Execute manualmente: npx prisma migrate deploy', 'yellow');
  }

  // Build backend
  if (!execCommand('npm run build', 'Compilando backend')) {
    process.exit(1);
  }

  // Limpar arquivos de desenvolvimento do backend
  log('🧹 Removendo arquivos desnecessários do backend...', 'yellow');
  const backendCleanup = ['src', 'node_modules', '.git', '.github', 'test', 'tests', '*.test.ts', '*.spec.ts'];
  backendCleanup.forEach(item => {
    const itemPath = path.join(backendDir, item);
    if (fs.existsSync(itemPath)) {
      fs.rmSync(itemPath, { recursive: true, force: true });
      log(`  ✓ Removido: ${item}`, 'green');
    }
  });

  // Reinstalar apenas dependências de produção
  log('📦 Instalando apenas dependências de produção...', 'yellow');
  execSync('npm install --omit=dev', { stdio: 'inherit' });

  // Instalar Frontend
  header('INSTALANDO FRONTEND');
  
  const frontendDir = path.join(config.installPath, 'frontend');
  process.chdir(frontendDir);
  
  if (!execCommand('npm install', 'Instalando dependências do frontend')) {
    process.exit(1);
  }

  // Build frontend
  if (!execCommand('npm run build', 'Compilando frontend')) {
    process.exit(1);
  }

  // Limpar arquivos de desenvolvimento do frontend
  log('🧹 Removendo arquivos desnecessários do frontend...', 'yellow');
  const frontendCleanup = ['src', 'node_modules', 'public', '.git', '.github', 'test', 'tests'];
  frontendCleanup.forEach(item => {
    const itemPath = path.join(frontendDir, item);
    if (fs.existsSync(itemPath)) {
      fs.rmSync(itemPath, { recursive: true, force: true });
      log(`  ✓ Removido: ${item}`, 'green');
    }
  });

  // Manter apenas dist e arquivos essenciais
  log('✅ Frontend otimizado para produção!', 'green');

  // Configurar frontend
  log('⚙️  Configurando frontend...', 'yellow');
  const configJsContent = `// Configuração do Frontend Siberius
window.SIBERIUS_CONFIG = {
  API_URL: 'http://localhost:${config.backendPort}',
  API_TIMEOUT: 10000,
  DEBUG: false
};
`;

  fs.writeFileSync(path.join(frontendDir, 'dist', 'config.js'), configJsContent);
  log('✅ Frontend configurado!', 'green');

  // Limpar pasta installer (não é mais necessária)
  const installerDir = path.join(config.installPath, 'installer');
  if (fs.existsSync(installerDir)) {
    fs.rmSync(installerDir, { recursive: true, force: true });
    log('🧹 Pasta installer removida', 'green');
  }

  // Criar arquivo de informações da instalação
  const infoContent = `# Instalação Siberius
Data: ${new Date().toLocaleString('pt-BR')}
Pasta: ${config.installPath}
Backend: http://localhost:${config.backendPort}
Frontend: http://localhost:${config.frontendPort}
`;
  fs.writeFileSync(path.join(config.installPath, 'INSTALACAO.txt'), infoContent);

  // PM2
  header('CONFIGURANDO PM2');
  
  const usePm2 = await question('Deseja instalar e configurar o PM2? (s/n): ');
  
  if (usePm2.toLowerCase() === 's') {
    log('📦 Instalando PM2 globalmente...', 'yellow');
    try {
      execSync('npm install -g pm2', { stdio: 'inherit' });
      log('✅ PM2 instalado!', 'green');

      // Iniciar serviços
      log('🚀 Iniciando backend...', 'yellow');
      process.chdir(backendDir);
      execSync('pm2 start dist/index.js --name siberius-backend', { stdio: 'inherit' });
      
      log('🚀 Iniciando frontend...', 'yellow');
      process.chdir(frontendDir);
      execSync('pm2 start "npx serve -s dist -p ' + config.frontendPort + '" --name siberius-frontend', { stdio: 'inherit' });
      
      execSync('pm2 save', { stdio: 'inherit' });
      
      log('✅ Serviços iniciados com PM2!', 'green');
    } catch (error) {
      log('⚠️  Erro ao configurar PM2. Configure manualmente.', 'yellow');
    }
  }

  // Finalização
  header('INSTALAÇÃO CONCLUÍDA! 🎉');
  
  console.log('');
  log('✅ Siberius instalado com sucesso!', 'green');
  console.log('');
  log('📁 LOCALIZAÇÃO DA INSTALAÇÃO:', 'bright');
  console.log(`   ${config.installPath}`);
  console.log('');
  log('🌐 ACESSE O SISTEMA:', 'bright');
  console.log('');
  console.log(`   Frontend:  http://localhost:${config.frontendPort}`);
  console.log(`   Backend:   http://localhost:${config.backendPort}`);
  console.log('');
  log('📊 TAMANHO DA INSTALAÇÃO:', 'bright');
  console.log(`   ~50-100 MB (apenas arquivos de produção)`);
  console.log('');
  
  if (usePm2.toLowerCase() === 's') {
    log('📊 COMANDOS PM2:', 'bright');
    console.log('');
    console.log('   Ver status:    pm2 status');
    console.log('   Ver logs:      pm2 logs');
    console.log('   Reiniciar:     pm2 restart all');
    console.log('   Parar:         pm2 stop all');
    console.log('');
  } else {
    log('🚀 INICIAR MANUALMENTE:', 'bright');
    console.log('');
    console.log('   Backend:');
    console.log(`      cd ${backendDir}`);
    console.log('      node dist/index.js');
    console.log('');
    console.log('   Frontend:');
    console.log(`      cd ${frontendDir}`);
    console.log(`      npx serve -s dist -p ${config.frontendPort}`);
    console.log('');
  }

  log('📚 Documentação completa em:', 'bright');
  console.log(`   ${path.join(frontendDir, 'README_CONFIG.md')}`);
  console.log('');
  
  log('═'.repeat(60), 'bright');
  
  rl.close();
}

main().catch(error => {
  log(`\n❌ Erro na instalação: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
