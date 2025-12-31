@echo off
REM Script de Deploy do Frontend Siberius (Windows)

echo ================================================
echo   Deploy Frontend Siberius
echo ================================================
echo.

REM Build
echo [1/3] Fazendo build...
call npm run build

if %errorlevel% neq 0 (
  echo.
  echo [ERRO] Build falhou!
  pause
  exit /b 1
)

echo [OK] Build concluido!
echo.

REM Pedir configurações
echo [2/3] Configuracao do Backend
set /p BACKEND_IP="Digite o IP/dominio do backend (ex: 192.168.1.100): "
set /p BACKEND_PORT="Digite a porta do backend [3000]: "
if "%BACKEND_PORT%"=="" set BACKEND_PORT=3000

REM Atualizar config.js
echo [3/3] Atualizando dist/config.js...

(
echo // Configuracao do Frontend Siberius
echo // Este arquivo pode ser editado diretamente em producao
echo.
echo window.SIBERIUS_CONFIG = {
echo   // URL do Backend API
echo   API_URL: 'http://%BACKEND_IP%:%BACKEND_PORT%',
echo.  
echo   // Timeout para requisicoes ^(em milissegundos^)
echo   API_TIMEOUT: 10000,
echo.  
echo   // Configuracoes opcionais
echo   DEBUG: false
echo };
) > dist\config.js

echo [OK] Configuracao atualizada!
echo.
echo ================================================
echo   Configuracao aplicada:
echo   API_URL: http://%BACKEND_IP%:%BACKEND_PORT%
echo ================================================
echo.

REM Verificar PM2
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
  echo [AVISO] PM2 nao encontrado.
  echo.
  echo Para instalar PM2:
  echo   npm install -g pm2
  echo.
  echo Para servir manualmente:
  echo   npm install -g serve
  echo   serve -s dist -p 5173
  echo.
  pause
  exit /b 0
)

REM PM2
set /p START_PM2="Iniciar com PM2? (s/n): "

if /i "%START_PM2%"=="s" (
  echo.
  echo [PM2] Reiniciando servico...
  call pm2 delete siberius-frontend 2>nul
  call pm2 start serve --name siberius-frontend -- -s dist -p 5173
  call pm2 save
  
  echo.
  echo ================================================
  echo   Deploy concluido!
  echo ================================================
  echo.
  echo Acesse em:
  echo   Local:  http://localhost:5173
  echo   Rede:   http://%BACKEND_IP%:5173
  echo.
  echo Comandos uteis:
  echo   Status: pm2 status
  echo   Logs:   pm2 logs siberius-frontend
  echo   Parar:  pm2 stop siberius-frontend
  echo ================================================
) else (
  echo.
  echo ================================================
  echo   Build pronto!
  echo ================================================
  echo.
  echo Para servir:
  echo   npm install -g serve
  echo   serve -s dist -p 5173
  echo ================================================
)

echo.
pause
