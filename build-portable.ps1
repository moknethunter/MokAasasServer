<#
.SYNOPSIS
    Builds a portable Windows bundle for Voice Server.
.DESCRIPTION
    Compiles TypeScript, installs production dependencies, and creates a
    self-contained folder that runs on any Windows 64-bit machine.
.EXAMPLE
    .\build-portable.ps1
    .\build-portable.ps1 -OutputDir "dist-portable" -Force
#>

param(
    [string]$OutputDir = "voice-server-portable",
    [switch]$SkipBuild,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# ───────────── Helpers ─────────────
function Write-Step { param($msg) Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "   [OK] $msg" -ForegroundColor Green }
function Write-Err  { param($msg) Write-Host "   [!!] $msg" -ForegroundColor Red }
function Write-Warn { param($msg) Write-Host "   [??] $msg" -ForegroundColor Yellow }
function Fail       { param($msg) Write-Err $msg; Read-Host "`nPress Enter to exit"; exit 1 }

# ───────────── Banner ─────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "  Voice Server - Portable Builder" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta

# ───────────── Prerequisites ─────────────
Write-Step "Checking prerequisites"

if (-not (Test-Path "package.json")) {
    Fail "package.json not found. Run this script from the project root."
}
Write-Ok "package.json found"

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Fail "Node.js not found. Install Node 20+ from https://nodejs.org"
}
$nodeVersion = & node --version
Write-Ok "Node.js $nodeVersion"
Write-Ok "Location: $($nodeCmd.Source)"

$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmCmd) { Fail "npm not found." }
Write-Ok "npm available"

if (-not (Test-Path ".env")) {
    Write-Warn ".env not found - copying from .env.example"
    if (-not (Test-Path ".env.example")) { Fail ".env.example not found either." }
    Copy-Item ".env.example" ".env"
    Write-Warn "Edit .env before running (ADMIN_PASSWORD_HASH, SESSION_SECRET)"
}

# ───────────── Output directory ─────────────
Write-Step "Preparing output directory: $OutputDir"

if (Test-Path $OutputDir) {
    if ($Force) {
        Write-Warn "Removing existing $OutputDir (Force)"
        Remove-Item $OutputDir -Recurse -Force
    } else {
        $answer = Read-Host "   $OutputDir already exists. Delete and rebuild? [y/N]"
        if ($answer -match '^[Yy]') {
            Remove-Item $OutputDir -Recurse -Force
        } else {
            Fail "Aborted."
        }
    }
}
New-Item -ItemType Directory -Path $OutputDir | Out-Null
Write-Ok "Created $OutputDir"

# ───────────── Build ─────────────
if (-not $SkipBuild) {
    Write-Step "Building TypeScript (npm run build)"
    & npm run build
    if ($LASTEXITCODE -ne 0) { Fail "TypeScript build failed." }
    Write-Ok "Build complete"
} else {
    Write-Warn "Skipping build (SkipBuild)"
    if (-not (Test-Path "dist")) { Fail "dist/ missing. Run build first." }
}

# ───────────── Prisma generate ─────────────
Write-Step "Generating Prisma client"
& npx prisma generate
if ($LASTEXITCODE -ne 0) { Fail "Prisma generate failed." }
Write-Ok "Prisma client generated"

# ───────────── Copy files ─────────────
Write-Step "Copying application files"

$itemsToCopy = @("dist", "public", "prisma", "package.json", "package-lock.json", ".env")

foreach ($item in $itemsToCopy) {
    if (Test-Path $item) {
        Copy-Item $item -Destination $OutputDir -Recurse -Force
        Write-Ok "Copied $item"
    } else {
        Write-Warn "Skipped $item (not found)"
    }
}

# ───────────── Install prod dependencies ─────────────
Write-Step "Installing production dependencies (npm ci --omit=dev)"
Push-Location $OutputDir
try {
    & npm ci --omit=dev
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Fail "npm ci failed in $OutputDir"
    }
    Write-Ok "Production dependencies installed"
} finally {
    Pop-Location
}

# ───────────── Copy Prisma generated client ─────────────
Write-Step "Copying generated Prisma client (with engine DLL)"
$prismaSource = "node_modules\.prisma"
$prismaDest = Join-Path $OutputDir "node_modules\.prisma"
if (Test-Path $prismaSource) {
    Copy-Item $prismaSource -Destination $prismaDest -Recurse -Force
    Write-Ok "Prisma client + engine DLL copied"

    $enginePath = Join-Path $prismaDest "client\query_engine-windows.dll.node"
    if (Test-Path $enginePath) {
        Write-Ok "query_engine-windows.dll.node verified"
    } else {
        Write-Warn "query_engine DLL not found - runtime may fail"
    }
} else {
    Fail "node_modules\.prisma not found. Run 'npx prisma generate' first."
}

# ───────────── Copy Node.js runtime ─────────────
Write-Step "Copying Node.js runtime"
Copy-Item $nodeCmd.Source -Destination (Join-Path $OutputDir "node.exe") -Force
Write-Ok "node.exe copied"

# ───────────── Create start.bat ─────────────
Write-Step "Creating start.bat"
$startBat = @"
@echo off
title Voice Server
cd /d "%~dp0"
echo.
echo Starting Voice Server...
echo.
node.exe dist/index.js
echo.
echo Server stopped. Press any key to close.
pause >nul
"@
Set-Content -Path (Join-Path $OutputDir "start.bat") -Value $startBat -Encoding ASCII
Write-Ok "start.bat created"

# ───────────── Create README ─────────────
Write-Step "Creating portable README"
$portableReadme = @"
# Voice Server - Portable

Self-contained build. No installation required.

## How to run
1. Double-click start.bat
2. Open http://localhost:3000
3. Login with credentials from .env

## Requirements
- Windows 64-bit
- PostgreSQL running (or Docker)

## Notes
- Edit .env to change port, credentials, database URL
- Do NOT delete node_modules - it contains the Prisma engine
"@
Set-Content -Path (Join-Path $OutputDir "README.md") -Value $portableReadme -Encoding UTF8
Write-Ok "README.md created"

# ───────────── Summary ─────────────
Write-Step "Summary"
$size = [math]::Round((Get-ChildItem $OutputDir -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB, 1)
Write-Host ""
Write-Host "  Location : $((Resolve-Path $OutputDir).Path)" -ForegroundColor White
Write-Host "  Size     : $size MB" -ForegroundColor White
Write-Host "  Run with : $OutputDir\start.bat" -ForegroundColor White
Write-Host ""
Write-Host "  Test it now:" -ForegroundColor Yellow
Write-Host "    cd $OutputDir" -ForegroundColor White
Write-Host "    .\start.bat" -ForegroundColor White
Write-Host ""
Write-Host "[DONE] Portable bundle ready!" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"
