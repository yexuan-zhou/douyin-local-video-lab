$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $root

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js is required. Install Node.js 20+ first."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm is required. Install Node.js 20+ first."
}

if (-not (Test-Path -LiteralPath "node_modules")) {
  Write-Host "Installing dependencies..."
  npm install
}

Write-Host "Opening local web demo..."
npm run demo
