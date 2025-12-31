#!/usr/bin/env node

/**
 * Instalador Siberius - Download e Instalação Rápida
 * 
 * curl -o install.js https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js
 * node install.js
 */

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       🚀  INSTALADOR SIBERIUS - Download do GitHub       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Preparando instalação...
`);

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// URL do instalador completo no GitHub
const INSTALLER_URL = 'https://raw.githubusercontent.com/SEU-USUARIO/siberius/main/installer/install.js';
const TEMP_FILE = path.join(__dirname, 'install-full.js');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('📥 Baixando instalador completo...\n');
    await download(INSTALLER_URL, TEMP_FILE);
    
    console.log('✅ Download concluído!\n');
    console.log('🚀 Iniciando instalação...\n');
    
    // Executar instalador completo
    require(TEMP_FILE);
    
  } catch (error) {
    console.error('❌ Erro ao baixar instalador:', error.message);
    console.error('\nTente clonar o repositório manualmente:');
    console.error('  git clone https://github.com/SEU-USUARIO/siberius.git');
    console.error('  cd siberius/installer');
    console.error('  node install.js');
    process.exit(1);
  }
}

main();
