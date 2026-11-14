@echo off
chcp 65001 >nul
title Dakota Vila
cd /d "%~dp0"

echo.
echo   ==========================================
echo            DAKOTA VILA - iniciando
echo   ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   O Node.js nao esta instalado neste computador.
  echo   Baixe em https://nodejs.org ^(versao LTS^), instale e abra este arquivo de novo.
  echo.
  pause
  exit /b
)

echo   Para jogar no CELULAR, abra o navegador e digite:
echo.
powershell -NoProfile -Command "$ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue; foreach ($i in $ips) { $a = $i.IPAddress; $n = $i.InterfaceAlias; if ($a -like '100.*' -and $n -like '*Tailscale*') { Write-Host ('     Em qualquer lugar (Tailscale ligado no celular):  http://' + $a + ':8080') } elseif (($a -like '192.168.*' -or $a -like '10.*') -and $n -notlike 'vEthernet*') { Write-Host ('     No Wi-Fi de casa:  http://' + $a + ':8080') } }"
echo.
echo   No PC: http://localhost:8080
echo.

netstat -ano | findstr /r /c:":8080 .*LISTENING" >nul
if not errorlevel 1 (
  echo   O jogo JA ESTA LIGADO. Pode abrir no celular.
  echo.
  start "" http://localhost:8080
  pause
  exit /b
)

echo   Deixe esta janela ABERTA enquanto estiver jogando.
echo   Para desligar o jogo, feche esta janela.
echo.
start "" http://localhost:8080
node server.js
echo.
echo   O jogo parou.
pause
