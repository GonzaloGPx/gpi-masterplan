@echo off
rem Lanzador desde la RAIZ del repo. Entra solo a Presentacion-AVSA y levanta el server.
rem (No importa desde donde lo ejecutes: usa la carpeta de este .bat.)
cd /d "%~dp0Presentacion-AVSA"
if not exist "serve.js" (
  echo No encuentro Presentacion-AVSA\serve.js junto a este lanzador.
  echo Deja este archivo en la raiz del repo gpi-masterplan.
  pause
  exit /b 1
)
start "GPI editor server" cmd /k node serve.js
timeout /t 1 >nul
start "" http://localhost:8123/demos/index.html
