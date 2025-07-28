# PowerShell script to fix hardcoded API URLs in all React components

$rootPath = "C:\Users\vincent\Downloads\XPswap\XPswap\client\src"
$files = @(
    "pages\xps-purchase.tsx",
    "pages\minting.tsx",
    "pages\memecoin.tsx",
    "pages\home.tsx",
    "pages\governance.tsx",
    "pages\documentation.tsx",
    "pages\bug-bounty.tsx",
    "pages\bridge.tsx",
    "components\YieldFarmingManager_BACKUP.tsx",
    "components\XPSStakingInterface.tsx",
    "components\TransactionHistory.tsx",
    "components\TopPairs.tsx",
    "components\Swap\SwapPriceInfo.tsx",
    "components\SecurityDashboard.tsx",
    "components\RealTimeAnalyticsDashboard.tsx",
    "components\OptionsTrading\PerpetualFuturesInterface.tsx",
    "components\OptionsTrading\OptionsInterface.tsx",
    "components\OptionsTrading\FlashLoansInterface.tsx",
    "components\LiquidityPools.tsx",
    "components\LiquidityPoolManager_OLD.tsx",
    "components\liquidity\RemoveLiquidityModal.tsx",
    "components\liquidity\AddLiquidityModal.tsx",
    "components\CrossChainBridge.tsx",
    "components\analytics\PairAnalyticsTable.tsx",
    "components\analytics\RiskInsights.tsx",
    "components\analytics\TokenAnalyticsTable.tsx",
    "components\bridge\BridgeForm.tsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path $rootPath $file
    
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        # Read file content
        $content = Get-Content $fullPath -Raw
        
        # Check if file already imports getApiUrl
        $hasImport = $content -match "import.*getApiUrl.*from.*apiUrl"
        
        # Add import if not present
        if (-not $hasImport) {
            # Find the last import line
            if ($content -match '((?:import[^;]+;\s*\n)+)') {
                $imports = $matches[1]
                $newImport = "import { getApiUrl } from `"@/lib/apiUrl`";"
                $content = $content -replace [regex]::Escape($imports), "$imports$newImport`n"
                Write-Host "  Added getApiUrl import" -ForegroundColor Green
            }
        }
        
        # Replace fetch calls
        $patterns = @(
            'fetch\s*\(\s*[''"`]/api/',
            'fetch\s*\(\s*`/api/'
        )
        
        $replacementCount = 0
        foreach ($pattern in $patterns) {
            $matches = [regex]::Matches($content, $pattern)
            $replacementCount += $matches.Count
            
            # Replace fetch("/api/...") with fetch(getApiUrl("/api/..."))
            $content = $content -replace 'fetch\s*\(\s*[''"]/api/', 'fetch(getApiUrl("/api/'
            $content = $content -replace 'fetch\s*\(\s*`/api/', 'fetch(getApiUrl(`/api/'
        }
        
        if ($replacementCount -gt 0) {
            # Save the modified content
            Set-Content -Path $fullPath -Value $content -NoNewline
            Write-Host "  Replaced $replacementCount fetch calls" -ForegroundColor Green
        } else {
            Write-Host "  No changes needed" -ForegroundColor Gray
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Cyan
