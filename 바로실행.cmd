@echo off
setlocal
cd /d "%~dp0"
call "%~dp00-safe-env.cmd"

set "PORT=3000"

echo ========================================
echo KCG local test server
echo Public site : http://127.0.0.1:%PORT%
echo Admin login : http://127.0.0.1:%PORT%/admin/login
echo Demo password : gold-demo-2026
echo Local preview uses build + start for stability.
echo Press Ctrl+C in this window to stop.
echo ========================================
echo.

if not exist "node_modules" (
  echo node_modules not found. Installing packages first...
  call npm.cmd install
  if errorlevel 1 (
    echo Install failed.
    pause
    exit /b 1
  )
)

echo Building site for local preview...
call npm.cmd run build
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)

start "" cmd /c "timeout /t 4 > nul && start http://127.0.0.1:%PORT%"
call npm.cmd run start
