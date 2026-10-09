@echo off
setlocal

set "REPO_ROOT=%~dp0"
set "WEB_DIR=%REPO_ROOT%apps\web"
set "SERVER_DIR=%REPO_ROOT%apps\server"

if not exist "%WEB_DIR%\package.json" (
  echo ERROR: No se encuentra el frontend en "%WEB_DIR%".
  pause
  exit /b 1
)

if not exist "%SERVER_DIR%\package.json" (
  echo ERROR: No se encuentra el backend en "%SERVER_DIR%".
  pause
  exit /b 1
)

netstat -ano -p tcp | findstr /R /C:":5173 .*LISTENING" >nul
if not errorlevel 1 (
  echo ERROR: El puerto 5173 ya esta en uso. Libera el puerto y vuelve a intentarlo.
  pause
  exit /b 1
)

echo Iniciando backend...
start "BlogDPC Backend" /D "%SERVER_DIR%" cmd /k "pnpm run dev"

echo Iniciando frontend...
start "BlogDPC Frontend" /D "%WEB_DIR%" cmd /k "pnpm run dev -- --host 127.0.0.1 --port 5173 --strictPort"

echo.
echo Esperando a que Vite este disponible...
set "INTENTOS=0"
:esperar_frontend
curl.exe --silent --fail --output nul http://127.0.0.1:5173/
if not errorlevel 1 goto frontend_listo
set /a INTENTOS+=1
if %INTENTOS% GEQ 30 goto frontend_timeout
timeout /t 2 /nobreak >nul
goto esperar_frontend

:frontend_listo
echo.
echo Frontend disponible en: http://localhost:5173/
echo Backend: http://localhost:3000/
echo.
echo Las CLI de frontend y backend siguen abiertas en sus propias ventanas.
echo Cierra esas ventanas para detener los servidores.
pause
exit /b 0

:frontend_timeout
echo.
echo ERROR: Vite no respondio en http://localhost:5173/ despues de 60 segundos.
echo Revisa la ventana "BlogDPC Frontend" para ver el error de inicio.
pause
exit /b 1
