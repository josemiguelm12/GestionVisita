@echo off
REM Azure WebJob Entry Point
REM Este script es ejecutado por Azure cuando inicia el WebJob

echo ====================================
echo GestionVisita Simulator - Starting
echo ====================================
echo.

REM Ejecutar el simulador (código compilado en dist/)
node dist/index.js

REM Si falla, registrar código de salida
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ====================================
    echo Error: Exit code %ERRORLEVEL%
    echo ====================================
    exit /b %ERRORLEVEL%
)
