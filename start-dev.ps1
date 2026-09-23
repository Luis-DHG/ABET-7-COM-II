#Requires -Version 5.1
<#
.SYNOPSIS
  Verifica pnpm (lo instala si falta) y arranca el front-end (apps\web) y el back-end (apps\server).

.DESCRIPTION
  1. Comprueba si `pnpm` esta disponible. Si no, lo instala con:
       Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
  2. Corre `pnpm install` en la raiz del proyecto y en apps\web y apps\server.
  3. Ejecuta `pnpm run dev` en apps\web y en apps\server (cada uno en su propia ventana/proceso).
  4. Detecta el puerto del front-end desde la salida de Vite y lo muestra en consola.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
#>

[CmdletBinding()]
param(
  [int]$TimeoutSegundos = 90,
  [string]$DirLogs = (Join-Path $env:TEMP "blogdpc-dev")
)

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot
$WebDir = Join-Path $RepoRoot "apps\web"
$ServerDir = Join-Path $RepoRoot "apps\server"

function Get-PnpmCmd {
  # Start-Process no puede lanzar .ps1 ("no es una aplicacion Win32 valida"),
  # asi que siempre se prefiere el shim .cmd/.exe, que si es ejecutable via CreateProcess.
  $c = Get-Command pnpm.cmd -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue
  if ($c -and (Test-Path -LiteralPath $c)) { return $c }
  # Tras instalar, el shim suele quedar aqui en Windows:
  $candidato = Join-Path $env:LOCALAPPDATA "pnpm\bin\pnpm.cmd"
  if (Test-Path -LiteralPath $candidato) { return $candidato }
  $exe = Get-Command pnpm.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue
  if ($exe -and (Test-Path -LiteralPath $exe)) { return $exe }
  # Ultimo recurso (solo sirve para `&`, no para Start-Process):
  $cualquiera = Get-Command pnpm -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue
  return $cualquiera
}

function Ensure-Pnpm {
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Write-Host ("pnpm encontrado: {0}" -f (pnpm --version))
    return (Get-PnpmCmd)
  }

  Write-Host "pnpm no encontrado. Instalando con get.pnpm.io..." -ForegroundColor Yellow
  Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression

  # Recargar PATH en esta sesion (el instalador usa PNPM_HOME / LOCALAPPDATA\pnpm\bin)
  $pnpmHome = if ($env:PNPM_HOME) { $env:PNPM_HOME } else { Join-Path $env:LOCALAPPDATA "pnpm" }
  $pnpmBin = Join-Path $pnpmHome "bin"
  if (($env:Path -split ";") -notcontains $pnpmBin -and (Test-Path -LiteralPath $pnpmBin)) {
    $env:Path = "$pnpmBin;$env:Path"
  }

  $encontrado = Get-PnpmCmd
  if (-not $encontrado) {
    throw "pnpm se instalo pero no aparece en el PATH. Cierra y reabre la terminal e intenta de nuevo."
  }
  Write-Host ("pnpm instalado: {0}" -f (& $encontrado --version))
  return $encontrado
}

function Get-FrontendPortFromText([string]$texto) {
  # Vite colorea la salida (http://localhost:<ansi>5173), asi que primero se limpian secuencias ANSI.
  $limpio = $texto -replace "$([char]27)\[[0-9;]*[A-Za-z]", ""
  # Vite imprime algo como: Local: http://localhost:5173/
  $m = [regex]::Match($limpio, "http://(?:localhost|127\.0\.0\.1):(\d+)")
  if ($m.Success) { return [int]$m.Groups[1].Value }
  return $null
}

# --- 1. pnpm ---
$PnpmCmd = Ensure-Pnpm
if ($PnpmCmd -like "*.ps1") {
  # Start-Process no acepta .ps1; buscar el .cmd hermano en la misma carpeta.
  $hermano = Join-Path (Split-Path -Parent $PnpmCmd) "pnpm.cmd"
  if (Test-Path -LiteralPath $hermano) { $PnpmCmd = $hermano }
}
if ($PnpmCmd -like "*.ps1") {
  throw "pnpm resolvio a '$PnpmCmd' (.ps1), que Start-Process no puede lanzar. Instala el shim .cmd de pnpm."
}
Write-Host ("Usando pnpm: {0}" -f $PnpmCmd)

foreach ($d in @($WebDir, $ServerDir)) {
  if (-not (Test-Path -LiteralPath $d)) { throw "No existe el directorio: $d" }
}

# --- 1b. Instalar dependencias ---
foreach ($d in @($RepoRoot, $WebDir, $ServerDir)) {
  Write-Host ("pnpm install en {0}..." -f $d) -ForegroundColor Cyan
  Push-Location -LiteralPath $d
  try {
    & $PnpmCmd install
    if ($LASTEXITCODE -ne 0) { throw "pnpm install fallo en $d (exit=$LASTEXITCODE)." }
  } finally {
    Pop-Location
  }
}

New-Item -ItemType Directory -Path $DirLogs -Force | Out-Null
$webOut = Join-Path $DirLogs "web-out.log"
$webErr = Join-Path $DirLogs "web-err.log"
$serverOut = Join-Path $DirLogs "server-out.log"
$serverErr = Join-Path $DirLogs "server-err.log"
foreach ($f in @($webOut, $webErr, $serverOut, $serverErr)) {
  if (Test-Path -LiteralPath $f) { Remove-Item -LiteralPath $f -Force }
}

# --- 3. Arrancar back-end y front-end ---
Write-Host "Arrancando back-end (apps\server)..." -ForegroundColor Cyan
$serverProc = Start-Process -FilePath $PnpmCmd -ArgumentList "run", "dev" `
  -WorkingDirectory $ServerDir `
  -RedirectStandardOutput $serverOut -RedirectStandardError $serverErr `
  -WindowStyle Hidden -PassThru

Write-Host "Arrancando front-end (apps\web)..." -ForegroundColor Cyan
$webProc = Start-Process -FilePath $PnpmCmd -ArgumentList "run", "dev" `
  -WorkingDirectory $WebDir `
  -RedirectStandardOutput $webOut -RedirectStandardError $webErr `
  -WindowStyle Hidden -PassThru

Write-Host ("  server PID={0}  log={1}" -f $serverProc.Id, $serverOut)
Write-Host ("  web    PID={0}  log={1}" -f $webProc.Id, $webOut)

# --- 3. Detectar puerto del front-end ---
$puerto = $null
$fin = (Get-Date).AddSeconds($TimeoutSegundos)
while ((Get-Date) -lt $fin) {
  Start-Sleep -Seconds 2
  $texto = ""
  if (Test-Path -LiteralPath $webOut) { $texto += (Get-Content -LiteralPath $webOut -Raw -ErrorAction SilentlyContinue) }
  if (Test-Path -LiteralPath $webErr) { $texto += (Get-Content -LiteralPath $webErr -Raw -ErrorAction SilentlyContinue) }
  $puerto = Get-FrontendPortFromText $texto
  if ($puerto) { break }

  if ($webProc.HasExited) {
    Write-Host "El proceso del front-end termino antes de mostrar el puerto. Ultima salida:" -ForegroundColor Red
    Write-Host $texto
    throw "Fallo al iniciar apps\web (proceso terminado). Revisa $webOut y $webErr."
  }
}

if (-not $puerto) {
  throw "No se detecto el puerto del front-end en $TimeoutSegundos s. Revisa $webOut y $webErr."
}

Write-Host ""
Write-Host ("Frontend iniciado en http://localhost:{0}/" -f $puerto) -ForegroundColor Green
Write-Host "Back-end: apps\server (por defecto http://localhost:3000, configurable con PORT en .env)."
Write-Host ("Logs en: {0}" -f $DirLogs)
Write-Host ("Para detener: Stop-Process -Id {0},{1}" -f $webProc.Id, $serverProc.Id)
