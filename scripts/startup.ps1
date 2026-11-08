<#
.SYNOPSIS
    Boots GoRosary.

.DESCRIPTION
    Checks the environment, installs dependencies if they are missing, compiles
    the prayer content, and starts whichever app you asked for.

.PARAMETER Target
    web     Start the website on http://localhost:3000 (default)
    mobile  Start the Expo app — scan the QR code with Expo Go
    all     Start both
    check   Validate the content and typecheck everything, then stop
    install Install dependencies and compile the content, then stop

.EXAMPLE
    .\scripts\startup.ps1
    .\scripts\startup.ps1 -Target mobile
    .\scripts\startup.ps1 -Target all
#>
[CmdletBinding()]
param(
    [ValidateSet('web', 'mobile', 'all', 'check', 'install')]
    [string]$Target = 'web'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Write-Step($message) {
    Write-Host ''
    Write-Host "==> $message" -ForegroundColor Cyan
}

function Write-Fail($message) {
    Write-Host "x  $message" -ForegroundColor Red
    exit 1
}

Write-Host ''
Write-Host 'GoRosary' -ForegroundColor White
Write-Host 'gorosary.app' -ForegroundColor DarkGray

# --- node ------------------------------------------------------------------
$nodeVersion = (& node --version 2>$null)
if (-not $nodeVersion) {
    Write-Fail 'Node is not installed. Install Node 20.11 or newer from https://nodejs.org'
}
Write-Step "Node $nodeVersion"

if ([int]($nodeVersion.TrimStart('v').Split('.')[0]) -lt 20) {
    Write-Fail "Node 20 or newer is required. You have $nodeVersion"
}

# --- dependencies ----------------------------------------------------------
if (-not (Test-Path (Join-Path $root 'node_modules'))) {
    Write-Step 'Installing dependencies (first run only)'
    & npm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { Write-Fail 'npm install failed' }
}

# --- content ---------------------------------------------------------------
Write-Step 'Compiling the prayer content and shared packages'
& npm run build:packages
if ($LASTEXITCODE -ne 0) {
    Write-Fail 'The content did not compile. Fix the files named in the error above.'
}

switch ($Target) {
    'install' {
        Write-Host ''
        Write-Host 'Ready. Run .\scripts\startup.ps1 to start the website.' -ForegroundColor Green
    }
    'check' {
        Write-Step 'Typechecking every workspace'
        & npm run typecheck
        if ($LASTEXITCODE -ne 0) { Write-Fail 'Typecheck failed' }
        Write-Host ''
        Write-Host 'Everything checks out.' -ForegroundColor Green
    }
    'web' {
        Write-Step 'Starting the website on http://localhost:3000'
        & npm run dev --workspace @gorosary/web
    }
    'mobile' {
        Write-Step 'Starting the Expo app'
        & npm run dev --workspace @gorosary/mobile
    }
    'all' {
        Write-Step 'Starting the website and the app'
        & npm run dev:all
    }
}
