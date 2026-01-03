@echo off
chcp 65001 >nul
title Instalador Siberius

REM Verificar se install.js existe
if not exist "install.js" (
    echo.
    echo [ERRO] Arquivo install.js nao encontrado!
    echo Execute este script a partir da pasta que contem install.js
    echo.
    pause
    exit /b 1
)

REM Executar instalador Node.js
node install.js

pause
