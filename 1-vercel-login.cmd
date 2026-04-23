@echo off
setlocal
cd /d "%~dp0"

set "NO_UPDATE_NOTIFIER=1"
set "XDG_CACHE_HOME=%cd%\.vercel-xdg\cache"
set "XDG_CONFIG_HOME=%cd%\.vercel-xdg\config"
set "XDG_DATA_HOME=%cd%\.vercel-xdg\data"
set "npm_config_cache=%cd%\.npm-cache"

if not exist ".vercel-cli\node_modules\vercel\dist\index.js" (
  echo Installing local Vercel CLI...
  call npm.cmd install --prefix .vercel-cli --ignore-scripts --no-package-lock vercel@latest
  if errorlevel 1 (
    echo Failed to install Vercel CLI.
    pause
    exit /b 1
  )
)

echo ========================================
echo Vercel browser login
echo 1. A browser approval page or device code will appear.
echo 2. Approve the login with your Vercel account.
echo 3. When login finishes, come back here and tell Codex.
echo ========================================
echo.

node .vercel-cli\node_modules\vercel\dist\index.js login

echo.
echo Login flow finished. You can close this window.
pause
