@echo off
rem Lanza el servidor local de edicion y abre el navegador en el indice de demos.
cd /d "%~dp0"
start "GPI editor server" cmd /k node serve.js
timeout /t 1 >nul
start "" http://localhost:8123/demos/index.html
