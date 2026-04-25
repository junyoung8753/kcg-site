@echo off
setlocal
cd /d "%~dp0"
call "%~dp00-safe-env.cmd"

set "TEAM_SCOPE=junyoung8753-2361s-projects"
set "PROJECT_NAME=kcg-confirm-preview"
set "LAST_URL_FILE=%cd%\.vercel-last-url.txt"
set "SITE_URL=https://kcg-confirm-preview.vercel.app"

if not exist ".vercel-cli\node_modules\vercel\dist\index.js" (
  echo Installing local Vercel CLI...
  call npm.cmd install --prefix .vercel-cli --ignore-scripts --no-package-lock vercel@latest
  if errorlevel 1 (
    echo Failed to install Vercel CLI.
    pause
    exit /b 1
  )
)

for /f "delims=" %%i in ('node .vercel-cli\node_modules\vercel\dist\index.js whoami 2^>nul') do set "VERCEL_USER=%%i"

if not defined VERCEL_USER (
  echo Vercel login not found.
  echo Run 1-vercel-login.cmd first, finish browser approval, then try again.
  pause
  exit /b 1
)

echo Logged in as %VERCEL_USER%
echo Starting preview deployment...
echo.

del /q "%LAST_URL_FILE%" 2>nul

node .vercel-cli\node_modules\vercel\dist\index.js ^
  link ^
  --scope %TEAM_SCOPE% ^
  --yes ^
  --project %PROJECT_NAME%

if errorlevel 1 (
  echo Failed to link Vercel project.
  pause
  exit /b 1
)

node .vercel-cli\node_modules\vercel\dist\index.js ^
  --scope %TEAM_SCOPE% ^
  --yes ^
  --format json ^
  --build-env KCG_FORCE_NOINDEX=1 ^
  --build-env NEXT_PUBLIC_SITE_URL=%SITE_URL% ^
  --build-env ADMIN_PASSWORD=0000 ^
  --build-env ADMIN_SESSION_SECRET=kcg-confirm-preview-session-2026-04-20-seoul ^
  --env KCG_FORCE_NOINDEX=1 ^
  --env NEXT_PUBLIC_SITE_URL=%SITE_URL% ^
  --env ADMIN_PASSWORD=0000 ^
  --env ADMIN_SESSION_SECRET=kcg-confirm-preview-session-2026-04-20-seoul ^
  > "%LAST_URL_FILE%"

if errorlevel 1 (
  echo Preview deployment failed.
  pause
  exit /b 1
)

for /f "delims=" %%i in ('node scripts\extract-vercel-url.mjs "%LAST_URL_FILE%"') do set "DEPLOY_URL=%%i"

if not defined DEPLOY_URL (
  echo Could not read preview deployment URL.
  pause
  exit /b 1
)

echo.
echo Verifying preview deployment with ordinary browser access...
set "SITE_AUDIT_URL=%DEPLOY_URL%"
call npm.cmd run audit:site
set "SITE_AUDIT_URL="
if errorlevel 1 (
  echo Preview verification failed.
  pause
  exit /b 1
)

echo.
echo Preview URL:
echo %DEPLOY_URL%
echo.
echo Main compare hub : %DEPLOY_URL%
echo Option 1         : %DEPLOY_URL%/option-1
echo Option 2         : %DEPLOY_URL%/option-2
echo Admin login      : %DEPLOY_URL%/admin/login
echo Admin password   : 0000
echo.
pause
