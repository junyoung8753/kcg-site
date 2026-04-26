param(
  [string[]]$Roots,
  [int]$MaxDepth = 7
)

$ErrorActionPreference = "Stop"

if (-not $Roots -or $Roots.Count -eq 0) {
  $candidateRoots = @(
    (Join-Path $env:USERPROFILE "Documents\Codex"),
    (Join-Path $env:USERPROFILE "Documents"),
    (Join-Path $env:USERPROFILE "Desktop"),
    (Join-Path $env:USERPROFILE "Downloads"),
    (Join-Path $env:USERPROFILE "OneDrive"),
    (Join-Path $env:USERPROFILE "OneDrive - Microsoft")
  )
  $Roots = $candidateRoots | Where-Object { Test-Path -LiteralPath $_ }
}

function Get-RelativeDepth {
  param(
    [Parameter(Mandatory = $true)][string]$Root,
    [Parameter(Mandatory = $true)][string]$Path
  )

  $rootParts = (Resolve-Path -LiteralPath $Root).Path.TrimEnd('\') -split '[\\/]'
  $pathParts = (Resolve-Path -LiteralPath $Path).Path.TrimEnd('\') -split '[\\/]'
  return [Math]::Max(0, $pathParts.Count - $rootParts.Count)
}

function Get-GitValue {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string[]]$Args
  )

  try {
    $output = & git -C $Path @Args 2>$null
    if ($LASTEXITCODE -eq 0 -and $output) {
      return (($output | Select-Object -First 1).ToString().Trim())
    }
  } catch {
    return ""
  }

  return ""
}

$results = New-Object System.Collections.Generic.List[object]

foreach ($root in $Roots) {
  if (-not (Test-Path -LiteralPath $root)) {
    continue
  }

  Write-Host ("Scanning {0}" -f $root)
  $packageFiles = Get-ChildItem -LiteralPath $root -Recurse -Force -Filter "package.json" -ErrorAction SilentlyContinue |
    Where-Object {
      $_.FullName -notmatch '\\node_modules\\' -and
      $_.FullName -notmatch '\\.next\\' -and
      (Get-RelativeDepth -Root $root -Path $_.DirectoryName) -le $MaxDepth
    }

  foreach ($packageFile in $packageFiles) {
    $projectRoot = $packageFile.DirectoryName
    $packageText = Get-Content -LiteralPath $packageFile.FullName -Raw -ErrorAction SilentlyContinue
    $vercelProject = ""
    $agentsText = ""
    $packageName = ""

    try {
      $packageJson = $packageText | ConvertFrom-Json
      $packageName = [string]$packageJson.name
    } catch {
      $packageName = ""
    }

    $vercelPath = Join-Path $projectRoot ".vercel\project.json"
    if (Test-Path -LiteralPath $vercelPath) {
      try {
        $vercelProject = [string]((Get-Content -LiteralPath $vercelPath -Raw | ConvertFrom-Json).projectName)
      } catch {
        $vercelProject = ""
      }
    }

    $agentsPath = Join-Path $projectRoot "AGENTS.md"
    if (Test-Path -LiteralPath $agentsPath) {
      $agentsText = Get-Content -LiteralPath $agentsPath -Raw -ErrorAction SilentlyContinue
    }

    $searchText = "$packageText`n$vercelProject`n$agentsText"
    $isCandidate =
      $searchText -match 'korea-center-gold-exchange|kcg-site|kcg-confirm-preview|gold-exchange|KCG Site' -or
      $vercelProject -eq "kcg-confirm-preview"

    if (-not $isCandidate) {
      continue
    }

    $branch = Get-GitValue -Path $projectRoot -Args @("branch", "--show-current")
    $commit = Get-GitValue -Path $projectRoot -Args @("rev-parse", "--short", "HEAD")
    $remote = Get-GitValue -Path $projectRoot -Args @("remote", "get-url", "origin")
    $status = ""
    try {
      $statusLines = @(& git -C $projectRoot status --short 2>$null)
      if ($LASTEXITCODE -eq 0) {
        $status = if ($statusLines.Count -eq 0) { "clean" } else { ("dirty:{0}" -f $statusLines.Count) }
      }
    } catch {
      $status = "not-git-or-unreadable"
    }

    $results.Add([PSCustomObject]@{
      Path = $projectRoot
      PackageName = $packageName
      VercelProject = $vercelProject
      GitBranch = $branch
      GitCommit = $commit
      GitRemote = $remote
      GitStatus = $status
      LastWriteTime = (Get-Item -LiteralPath $projectRoot).LastWriteTime
    })
  }
}

if ($results.Count -eq 0) {
  Write-Host "No KCG candidate workspaces found."
  exit 0
}

$results |
  Sort-Object LastWriteTime -Descending |
  Format-Table -AutoSize Path, PackageName, VercelProject, GitBranch, GitCommit, GitStatus, LastWriteTime, GitRemote

Write-Host ""
Write-Host "Use the newest candidate with the expected Vercel/GitHub remote as the local workspace to inspect, verify, or push."
