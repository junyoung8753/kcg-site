@echo off
setlocal
cd /d "%~dp0"
call "%~dp00-safe-env.cmd"

echo ========================================
echo KCG validation check
echo - lint
echo - typecheck
echo - site fidelity audit
echo - production build
echo - browser fidelity tests
echo - npm audit
echo - local browser screenshots
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

call npm.cmd run test:site
if errorlevel 1 goto fail

call npm.cmd audit --audit-level=moderate
if errorlevel 1 goto fail

call npm.cmd run screenshot:site
if errorlevel 1 goto fail

echo.
echo Validation completed.
echo Screenshots are saved in output\screenshots inside this project.
pause
exit /b 0

:fail
echo.
echo Validation failed. Check the message above.
pause
exit /b 1
