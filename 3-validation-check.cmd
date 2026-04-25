@echo off
setlocal
cd /d "%~dp0"
call "%~dp00-safe-env.cmd"

set "SITE_URL=https://kcg-confirm-preview.vercel.app"
set "PWCLI=npx --package @playwright/cli playwright-cli"

echo ========================================
echo KCG validation check
echo - lint
echo - typecheck
echo - site fidelity audit
echo - production build
echo - npm audit
echo - browser screenshots
echo ========================================
echo.

call npm.cmd run lint
if errorlevel 1 goto fail

call npm.cmd run typecheck
if errorlevel 1 goto fail

call npm.cmd run audit:site
if errorlevel 1 goto fail

call npm.cmd run build
if errorlevel 1 goto fail

call npm.cmd audit --audit-level=moderate
if errorlevel 1 goto fail

echo.
echo Opening preview site with Playwright...
cmd /c "%PWCLI% open %SITE_URL%/"
if errorlevel 1 goto fail

cmd /c "%PWCLI% resize 1440 900"
if errorlevel 1 goto fail

cmd /c "%PWCLI% screenshot"
if errorlevel 1 goto fail

cmd /c "%PWCLI% goto %SITE_URL%/prices"
if errorlevel 1 goto fail

cmd /c "%PWCLI% screenshot"
if errorlevel 1 goto fail

echo.
echo Validation completed.
echo Screenshots are saved in .playwright-cli inside this project.
pause
exit /b 0

:fail
echo.
echo Validation failed. Check the message above.
pause
exit /b 1
