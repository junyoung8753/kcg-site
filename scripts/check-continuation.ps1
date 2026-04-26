param(
  [switch]$Install,
  [switch]$PullVercel,
  [switch]$RunChecks,
  [switch]$UseProjectLocalCliState,
  [string]$VercelProject = "kcg-confirm-preview",
  [string]$VercelScope = "junyoung8753-2361s-projects"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $ProjectRoot

$env:NO_UPDATE_NOTIFIER = "1"
$env:npm_config_cache = Join-Path $ProjectRoot ".npm-cache"

foreach ($dir in @($env:npm_config_cache)) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

if ($UseProjectLocalCliState) {
  $env:APPDATA = Join-Path $ProjectRoot ".appdata"
  $env:LOCALAPPDATA = Join-Path $ProjectRoot ".localappdata"
  $env:XDG_CACHE_HOME = Join-Path $ProjectRoot ".vercel-xdg\cache"
  $env:XDG_CONFIG_HOME = Join-Path $ProjectRoot ".vercel-xdg\config"
  $env:XDG_DATA_HOME = Join-Path $ProjectRoot ".vercel-xdg\data"

  foreach ($dir in @($env:APPDATA, $env:LOCALAPPDATA, $env:XDG_CACHE_HOME, $env:XDG_CONFIG_HOME, $env:XDG_DATA_HOME)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
}

function Test-CommandAvailable {
  param([Parameter(Mandatory = $true)][string]$Name)
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-VersionLine {
  param([Parameter(Mandatory = $true)][string]$Name)

  try {
    $output = & cmd.exe /d /c "$Name --version 2>&1"
    if ($output) {
      return ($output | Select-Object -First 1)
    }
  } catch {
    return ""
  }

  return ""
}

function Write-Check {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][bool]$Ok,
    [string]$Detail = ""
  )

  $mark = if ($Ok) { "OK" } else { "MISSING" }
  if ($Detail) {
    Write-Host ("[{0}] {1} - {2}" -f $mark, $Name, $Detail)
  } else {
    Write-Host ("[{0}] {1}" -f $mark, $Name)
  }
}

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][scriptblock]$Script
  )

  Write-Host ""
  Write-Host ("==> {0}" -f $Name)
  & $Script
}

Write-Host "KCG continuation check"
Write-Host ("Project: {0}" -f $ProjectRoot)
Write-Host ""

$requiredCommands = @("git", "node", "npm")
$optionalCommands = @("gh", "vercel", "codex")
$missingRequired = @()

foreach ($cmd in $requiredCommands) {
  $ok = Test-CommandAvailable $cmd
  if (-not $ok) { $missingRequired += $cmd }
  $version = if ($ok) { Get-VersionLine $cmd } else { "" }
  Write-Check $cmd $ok $version
}

foreach ($cmd in $optionalCommands) {
  $ok = Test-CommandAvailable $cmd
  $version = if ($ok) { Get-VersionLine $cmd } else { "" }
  Write-Check $cmd $ok $version
}

if ($missingRequired.Count -gt 0) {
  throw ("Missing required command(s): {0}" -f ($missingRequired -join ", "))
}

Invoke-Step "Git state" {
  $inside = (& git rev-parse --is-inside-work-tree).Trim()
  if ($inside -ne "true") {
    throw "This folder is not inside a Git worktree."
  }

  $branch = (& git branch --show-current).Trim()
  $remote = (& git remote get-url origin).Trim()
  $status = @(& git status --short)

  Write-Host ("Branch: {0}" -f $(if ($branch) { $branch } else { "(detached HEAD)" }))
  Write-Host ("Origin: {0}" -f $remote)
  Write-Host ("Working changes: {0}" -f $status.Count)
  if ($status.Count -gt 0) {
    $status | ForEach-Object { Write-Host ("  {0}" -f $_) }
  }
}

if ($Install) {
  Invoke-Step "Install dependencies" {
    if (Test-Path -LiteralPath (Join-Path $ProjectRoot "package-lock.json")) {
      & npm ci
    } else {
      & npm install
    }
  }
}

if ($PullVercel) {
  if (-not (Test-CommandAvailable "vercel")) {
    throw "Vercel CLI is not installed or not on PATH. Install/login first, then rerun with -PullVercel."
  }

  Invoke-Step "Vercel account" {
    & vercel whoami
  }

  Invoke-Step "Vercel link" {
    & vercel link --yes --project $VercelProject --scope $VercelScope
  }

  Invoke-Step "Vercel pull" {
    & vercel pull --yes --scope $VercelScope
  }
}

if ($RunChecks) {
  Invoke-Step "Lint" { & npm run lint }
  Invoke-Step "Typecheck" { & npm run typecheck }
  Invoke-Step "Site fidelity audit" { & npm run audit:site }
  Invoke-Step "Build" { & npm run build }
  Invoke-Step "Browser fidelity tests" { & npm run test:site }
  Invoke-Step "npm audit" { & npm audit --audit-level=moderate }
}

Write-Host ""
Write-Host "Continuation check finished."
Write-Host "Before switching computers, commit and push meaningful work. On another computer, clone/pull this repo and rerun this script."
