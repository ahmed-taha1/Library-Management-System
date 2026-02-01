# Library Management System - Setup Script (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Library Management System - Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host "⚠ Please update .env with your configuration before running in production" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Start Docker containers (database only)
Write-Host ""
Write-Host "Starting database container..." -ForegroundColor Yellow
docker-compose up -d postgres
Write-Host "✓ Database container started" -ForegroundColor Green

# Wait for database to be ready
Write-Host ""
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$maxRetries = 30
$retryCount = 0
do {
    $result = docker-compose exec -T postgres pg_isready -U postgres 2>&1
    if ($LASTEXITCODE -eq 0) {
        break
    }
    Write-Host "Waiting for PostgreSQL..."
    Start-Sleep -Seconds 2
    $retryCount++
} while ($retryCount -lt $maxRetries)

if ($retryCount -eq $maxRetries) {
    Write-Host "Error: Database did not become ready in time" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Database is ready" -ForegroundColor Green

# Generate Prisma client
Write-Host ""
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✓ Prisma client generated" -ForegroundColor Green

# Run database migrations
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow
npx prisma migrate deploy
Write-Host "✓ Migrations applied" -ForegroundColor Green

# Seed database (optional)
Write-Host ""
$seed = Read-Host "Do you want to seed the database with sample data? (y/n)"
if ($seed -eq "y" -or $seed -eq "Y") {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    npx prisma db seed
    Write-Host "✓ Database seeded" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the development server:"
Write-Host "  npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "To start with Docker:"
Write-Host "  docker-compose up --build" -ForegroundColor White
Write-Host ""
Write-Host "API will be available at: http://localhost:4001/api" -ForegroundColor White
Write-Host ""
