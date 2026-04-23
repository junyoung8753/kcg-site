@echo off
rem Project-local Windows runtime guard.
rem This avoids PowerShell npm.ps1 execution policy and user-profile cache EPERM issues.

set "PROJECT_ROOT=%~dp0"
set "NO_UPDATE_NOTIFIER=1"
set "npm_config_cache=%PROJECT_ROOT%.npm-cache"
set "APPDATA=%PROJECT_ROOT%.appdata"
set "LOCALAPPDATA=%PROJECT_ROOT%.localappdata"
set "XDG_CACHE_HOME=%PROJECT_ROOT%.vercel-xdg\cache"
set "XDG_CONFIG_HOME=%PROJECT_ROOT%.vercel-xdg\config"
set "XDG_DATA_HOME=%PROJECT_ROOT%.vercel-xdg\data"

if not exist "%npm_config_cache%" mkdir "%npm_config_cache%" >nul 2>nul
if not exist "%APPDATA%" mkdir "%APPDATA%" >nul 2>nul
if not exist "%LOCALAPPDATA%" mkdir "%LOCALAPPDATA%" >nul 2>nul
if not exist "%XDG_CACHE_HOME%" mkdir "%XDG_CACHE_HOME%" >nul 2>nul
if not exist "%XDG_CONFIG_HOME%" mkdir "%XDG_CONFIG_HOME%" >nul 2>nul
if not exist "%XDG_DATA_HOME%" mkdir "%XDG_DATA_HOME%" >nul 2>nul
