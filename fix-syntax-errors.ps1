# Fix syntax errors in all files
$rootPath = "C:\Users\vincent\Downloads\XPswap\XPswap\client\src"

# Find all files with syntax errors (missing closing parenthesis)
$patterns = @(
    @{Find='fetch\(getApiUrl\("([^"]+)";'; Replace='fetch(getApiUrl("$1"));'},
    @{Find="fetch\(getApiUrl\('([^']+)';"; Replace='fetch(getApiUrl("$1"));'},
    @{Find="fetch\(getApiUrl\(`"([^`"]+)`";"; Replace='fetch(getApiUrl(`"$1`"));'}
)

Get-ChildItem -Path $rootPath -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $modified = $false
    
    foreach ($pattern in $patterns) {
        if ($content -match $pattern.Find) {
            $content = $content -replace $pattern.Find, $pattern.Replace
            $modified = $true
            Write-Host "Fixed syntax in: $($_.Name)" -ForegroundColor Green
        }
    }
    
    if ($modified) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
    }
}

Write-Host "Syntax fixes complete!" -ForegroundColor Cyan
