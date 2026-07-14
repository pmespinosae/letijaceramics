@echo off
chcp 65001 >nul
title Letija Ceramics - servidor local (NO CERRAR ESTA VENTANA)
cd /d "%~dp0"

echo.
echo   ==================================================
echo      LETIJA CERAMICS
echo   ==================================================
echo.
echo   Iniciando... la pagina se abrira en tu navegador
echo   en unos segundos.
echo.
echo   * NO cierres esta ventana mientras ves la pagina.
echo   * Para terminar, simplemente cierra esta ventana.
echo.

REM Abrir el navegador despues de 2 segundos, en paralelo al servidor
start "" /b powershell -NoProfile -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:8000/'"

REM Elegir el motor disponible (Python o Node) y arrancar el servidor
where python >nul 2>&1
if %errorlevel%==0 goto usepython
where py >nul 2>&1
if %errorlevel%==0 goto usepy
where npx >nul 2>&1
if %errorlevel%==0 goto usenode

echo.
echo   No se encontro Python ni Node.js en este equipo.
echo   Instala Python (gratis) desde https://www.python.org/downloads/
echo   y vuelve a hacer doble clic en este archivo.
echo.
pause
goto :eof

:usepython
python -m http.server 8000
goto :eof

:usepy
py -m http.server 8000
goto :eof

:usenode
npx --yes http-server -p 8000
goto :eof
