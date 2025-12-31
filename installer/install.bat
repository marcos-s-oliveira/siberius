@echo off
chcp 65001 >nul
title Instalador Siberius

REM Verificar se está na pasta correta
if not exist "..\backend" (
    echo.
    echo [ERRO] Execute este script a partir da pasta 'installer'
    echo.
    pause
    exit /b 1
)

REM Executar instalador Node.js
node install.js

pause
