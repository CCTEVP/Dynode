# Test script to verify complete logging flow
# Run this after restarting all services

Write-Host "=== Testing Dynode Logging Flow ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Verify source.dynode is running
Write-Host "1. Checking source.dynode status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3333/files/log" -Method GET -ErrorAction Stop
    Write-Host "   ✓ source.dynode is running on port 3333" -ForegroundColor Green
} catch {
    Write-Host "   ✗ source.dynode is NOT running!" -ForegroundColor Red
    exit 1
}

# Test 2: Send test logs from each service
Write-Host ""
Write-Host "2. Sending test logs from each service..." -ForegroundColor Yellow

$testLogs = @(
    @{origin='render.dynode'; message='Test from render'; port=5555},
    @{origin='build.dynode'; message='Test from builder'; port=4444},
    @{origin='echo.dynode'; message='Test from echo'; port=7777}
)

foreach ($log in $testLogs) {
    $body = @{
        level = 'info'
        message = $log.message
        meta = @{testTime = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')}
        origin = $log.origin
    } | ConvertTo-Json

    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3333/files/log" -Method POST -Body $body -ContentType 'application/json' -ErrorAction Stop
        Write-Host "   ✓ Sent log from $($log.origin)" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ Failed to send log from $($log.origin): $_" -ForegroundColor Red
    }
}

# Wait for MongoDB buffer flush
Write-Host ""
Write-Host "3. Waiting for logs to flush to MongoDB (6 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 6

# Test 3: Query logs from database
Write-Host ""
Write-Host "4. Querying logs from database..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3333/files/log?limit=10" -Method GET
    $logCount = $result.data.Count
    
    if ($logCount -gt 0) {
        Write-Host "   ✓ Found $logCount logs in database" -ForegroundColor Green
        Write-Host ""
        Write-Host "Recent logs:" -ForegroundColor Cyan
        $result.data | ForEach-Object {
            Write-Host "   - [$($_.level)] [$($_.origin)] $($_.message)" -ForegroundColor White
        }
    } else {
        Write-Host "   ⚠ No logs found in database" -ForegroundColor Yellow
        Write-Host "   This could mean:" -ForegroundColor Yellow
        Write-Host "   - MongoDB logging is not enabled (check config.enableDbLogging)" -ForegroundColor Yellow
        Write-Host "   - Database connection failed" -ForegroundColor Yellow  
        Write-Host "   - Logs haven't flushed yet (buffer size or time interval)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Failed to query logs: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
