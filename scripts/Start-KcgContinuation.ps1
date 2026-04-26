param(
  [string]$ProjectRoot = (Join-Path $HOME "Documents\Codex\projects\kcg-site"),
  [string]$RepositoryUrl = "https://github.com/junyoung8753/kcg-site.git",
  [switch]$RunChecks
)

$ErrorActionPreference = "Stop"

function Write-Section {
  param([Parameter(Mandatory = $true)][string]$Text)
  Write-Host ""
  Write-Host ("==> {0}" -f $Text)
}

function Test-CommandAvailable {
  param([Parameter(Mandatory = $true)][string]$Name)
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-VersionLine {
  param([Parameter(Mandatory = $true)][string]$Name)
  try {
    $output = & cmd.exe /d /c "$Name --version 2>&1"
    return ($output | Select-Object -First 1)
  } catch {
    return ""
  }
}

function Write-ToolStatus {
  param([Parameter(Mandatory = $true)][string]$Name)
  $ok = Test-CommandAvailable $Name
  $mark = if ($ok) { "OK" } else { "MISSING" }
  $version = if ($ok) { Get-VersionLine $Name } else { "" }
  if ($version) {
    Write-Host ("[{0}] {1} - {2}" -f $mark, $Name, $version)
  } else {
    Write-Host ("[{0}] {1}" -f $mark, $Name)
  }
  return $ok
}

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
  & git @GitArgs
  if ($LASTEXITCODE -ne 0) {
    throw ("git {0} failed with exit code {1}" -f ($GitArgs -join " "), $LASTEXITCODE)
  }
}

Write-Host "KCG site continuation bootstrap"
Write-Host ("Target folder: {0}" -f $ProjectRoot)
Write-Host ("Repository: {0}" -f $RepositoryUrl)

Write-Section "Tool check"
$gitOk = Write-ToolStatus git
$nodeOk = Write-ToolStatus node
$npmOk = Write-ToolStatus npm
$ghOk = Write-ToolStatus gh
$vercelOk = Write-ToolStatus vercel
$codexOk = Write-ToolStatus codex

if (-not ($gitOk -and $nodeOk -and $npmOk)) {
  Write-Host ""
  Write-Host "Required tools are missing. Install these first, then rerun this command:"
  Write-Host "- Git for Windows: https://git-scm.com/download/win"
  Write-Host "- Node.js 24 LTS/current: https://nodejs.org/"
  Write-Host ""
  Write-Host "Optional but recommended:"
  Write-Host "- GitHub CLI: https://cli.github.com/"
  Write-Host "- Vercel CLI: npm install -g vercel"
  exit 2
}

Write-Section "Prepare folder"
$parent = Split-Path -Parent $ProjectRoot
New-Item -ItemType Directory -Force -Path $parent | Out-Null

if (Test-Path -LiteralPath $ProjectRoot) {
  if (Test-Path -LiteralPath (Join-Path $ProjectRoot ".git")) {
    Write-Host "Existing repo found. Pulling latest main..."
    Set-Location $ProjectRoot
    Invoke-Git remote -v
    Invoke-Git fetch origin
    $branch = (& git branch --show-current).Trim()
    if ($branch -and $branch -ne "main") {
      Write-Host ("Current branch is '{0}'. Switching to main." -f $branch)
      Invoke-Git switch main
    }
    Invoke-Git pull --ff-only origin main
  } else {
    $timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
    $archive = "{0}-not-git-{1}" -f $ProjectRoot, $timestamp
    Write-Host ("Target folder exists but is not a Git repo. Moving it aside: {0}" -f $archive)
    Move-Item -LiteralPath $ProjectRoot -Destination $archive
    Invoke-Git clone $RepositoryUrl $ProjectRoot
    Set-Location $ProjectRoot
  }
} else {
  Write-Host "No existing repo found. Cloning..."
  Invoke-Git clone $RepositoryUrl $ProjectRoot
  Set-Location $ProjectRoot
}

Write-Section "Continuation setup"
$checkScript = Join-Path $ProjectRoot "scripts\check-continuation.ps1"
if (-not (Test-Path -LiteralPath $checkScript)) {
  throw "Missing scripts\check-continuation.ps1 after clone/pull."
}

$checkArgs = @("-Install")
if ($vercelOk) {
  try {
    & vercel whoami | Out-Host
    if ($LASTEXITCODE -eq 0) {
      $checkArgs += "-PullVercel"
    } else {
      Write-Host "Vercel CLI is installed but not logged in. Run: vercel login"
    }
  } catch {
    Write-Host "Vercel CLI login is not ready. Run: vercel login"
  }
} else {
  Write-Host "Vercel CLI not found. Skipping Vercel link/pull. Later run: npm install -g vercel"
}

if ($RunChecks) {
  $checkArgs += "-RunChecks"
}

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $checkScript @checkArgs
if ($LASTEXITCODE -ne 0) {
  throw "Continuation check failed."
}

Write-Section "Handoff"
Write-Host "Open this folder in Codex Project:"
Write-Host $ProjectRoot
Write-Host ""
Write-Host "Then start a new KCG project chat and paste the New Chat Prompt from:"
Write-Host (Join-Path $ProjectRoot "docs\setup\CURRENT_HANDOFF.md")
