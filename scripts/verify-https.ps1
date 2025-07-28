# HTTPS Configuration Verification Script for XPSwap (Windows)

Write-Host "🔒 XPSwap HTTPS Configuration Verification" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue

# Check if domain is provided
param(
    [string]$Domain = "trendy.storydot.kr"
)

$BaseUrl = "https://$Domain/xpswap"
$Report = @()

# Function to check SSL certificate
function Check-SSLCertificate {
    Write-Host "`n📋 Checking SSL Certificate..." -ForegroundColor Yellow
    
    try {
        $request = [System.Net.HttpWebRequest]::Create($BaseUrl)
        $request.Method = "GET"
        $request.Timeout = 5000
        $request.ServerCertificateValidationCallback = {$true}
        
        $response = $request.GetResponse()
        $cert = $request.ServicePoint.Certificate
        
        if ($cert) {
            Write-Host "Certificate Subject: $($cert.Subject)" -ForegroundColor Green
            Write-Host "Certificate Issuer: $($cert.Issuer)" -ForegroundColor Green
            Write-Host "Valid From: $($cert.GetEffectiveDateString())" -ForegroundColor Green
            Write-Host "Valid To: $($cert.GetExpirationDateString())" -ForegroundColor Green
            
            $expirationDate = [DateTime]::Parse($cert.GetExpirationDateString())
            $daysUntilExpiry = ($expirationDate - (Get-Date)).Days
            
            if ($daysUntilExpiry -gt 30) {
                Write-Host "✅ SSL certificate is valid for $daysUntilExpiry more days" -ForegroundColor Green
                $script:Report += "SSL Certificate: PASS (expires in $daysUntilExpiry days)"
            } elseif ($daysUntilExpiry -gt 0) {
                Write-Host "⚠️  SSL certificate expires in $daysUntilExpiry days" -ForegroundColor Yellow
                $script:Report += "SSL Certificate: WARNING (expires in $daysUntilExpiry days)"
            } else {
                Write-Host "❌ SSL certificate is expired" -ForegroundColor Red
                $script:Report += "SSL Certificate: FAIL (expired)"
            }
        }
        
        $response.Close()
    } catch {
        Write-Host "❌ Could not retrieve SSL certificate: $_" -ForegroundColor Red
        $script:Report += "SSL Certificate: FAIL (could not retrieve)"
    }
}

# Function to check HTTPS redirect
function Check-HTTPSRedirect {
    Write-Host "`n🔄 Checking HTTP to HTTPS redirect..." -ForegroundColor Yellow
    
    try {
        $httpUrl = "http://$Domain/xpswap"
        $request = [System.Net.HttpWebRequest]::Create($httpUrl)
        $request.Method = "GET"
        $request.AllowAutoRedirect = $false
        $request.Timeout = 5000
        
        $response = $request.GetResponse()
        $statusCode = [int]$response.StatusCode
        $location = $response.Headers["Location"]
        
        if ($statusCode -in 301, 302, 307, 308 -and $location -like "https://*") {
            Write-Host "✅ HTTP correctly redirects to HTTPS" -ForegroundColor Green
            Write-Host "   Redirect URL: $location" -ForegroundColor Gray
            $script:Report += "HTTPS Redirect: PASS"
        } else {
            Write-Host "⚠️  HTTP does not redirect to HTTPS" -ForegroundColor Yellow
            $script:Report += "HTTPS Redirect: NOT CONFIGURED"
        }
        
        $response.Close()
    } catch {
        Write-Host "⚠️  Could not check HTTP redirect: $_" -ForegroundColor Yellow
        $script:Report += "HTTPS Redirect: UNKNOWN"
    }
}

# Function to check security headers
function Check-SecurityHeaders {
    Write-Host "`n🛡️  Checking Security Headers..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $BaseUrl -Method Head -UseBasicParsing
        $headers = $response.Headers
        
        $securityHeaders = @{
            "Strict-Transport-Security" = "HSTS"
            "X-Content-Type-Options" = "nosniff protection"
            "X-Frame-Options" = "Clickjacking protection"
            "X-XSS-Protection" = "XSS protection"
            "Content-Security-Policy" = "CSP"
            "Referrer-Policy" = "Referrer policy"
        }
        
        $missingHeaders = @()
        
        foreach ($header in $securityHeaders.Keys) {
            if ($headers.ContainsKey($header)) {
                Write-Host "✅ $($securityHeaders[$header]): $header" -ForegroundColor Green
                Write-Host "   Value: $($headers[$header])" -ForegroundColor Gray
            } else {
                Write-Host "❌ Missing: $header ($($securityHeaders[$header]))" -ForegroundColor Red
                $missingHeaders += $header
            }
        }
        
        if ($missingHeaders.Count -eq 0) {
            $script:Report += "Security Headers: PASS (all present)"
        } else {
            $script:Report += "Security Headers: PARTIAL ($($missingHeaders.Count) missing)"
        }
    } catch {
        Write-Host "❌ Could not check security headers: $_" -ForegroundColor Red
        $script:Report += "Security Headers: FAIL"
    }
}

# Function to check mixed content
function Check-MixedContent {
    Write-Host "`n🔍 Checking for Mixed Content..." -ForegroundColor Yellow
    
    try {
        $pageContent = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing
        $html = $pageContent.Content
        
        # Check for HTTP resources
        $httpResources = [regex]::Matches($html, '(src|href)="http://[^"]*"')
        
        if ($httpResources.Count -eq 0) {
            Write-Host "✅ No obvious mixed content detected" -ForegroundColor Green
            $script:Report += "Mixed Content: PASS"
        } else {
            Write-Host "❌ Potential mixed content found:" -ForegroundColor Red
            $httpResources | Select-Object -First 5 | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Red
            }
            $script:Report += "Mixed Content: FAIL ($($httpResources.Count) HTTP resources)"
        }
        
        # Check for protocol-relative URLs
        $protocolRelative = [regex]::Matches($html, '(src|href)="//[^"]*"')
        if ($protocolRelative.Count -gt 0) {
            Write-Host "⚠️  Found $($protocolRelative.Count) protocol-relative URLs" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Could not check for mixed content: $_" -ForegroundColor Red
        $script:Report += "Mixed Content: UNKNOWN"
    }
}

# Function to test API endpoints
function Check-APIEndpoints {
    Write-Host "`n🔌 Checking API Endpoints over HTTPS..." -ForegroundColor Yellow
    
    $endpoints = @(
        "/api/health",
        "/api/xp-price",
        "/api/market-stats"
    )
    
    $passCount = 0
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri "$BaseUrl$endpoint" -Method Get -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
                $passCount++
            } else {
                Write-Host "❌ $endpoint - Status: $($response.StatusCode)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ $endpoint - Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    $script:Report += "API Endpoints: $passCount/$($endpoints.Count) PASS"
}

# Function to check TLS versions
function Check-TLSVersions {
    Write-Host "`n🔐 Checking TLS Version Support..." -ForegroundColor Yellow
    
    try {
        # Get the current TLS settings
        $currentProtocols = [System.Net.ServicePointManager]::SecurityProtocol
        Write-Host "Current system TLS settings: $currentProtocols" -ForegroundColor Gray
        
        # Test different TLS versions
        $tlsVersions = @{
            "Tls" = 192
            "Tls11" = 768
            "Tls12" = 3072
            "Tls13" = 12288
        }
        
        $supportedVersions = @()
        
        foreach ($version in $tlsVersions.Keys) {
            try {
                [System.Net.ServicePointManager]::SecurityProtocol = $tlsVersions[$version]
                $request = [System.Net.HttpWebRequest]::Create($BaseUrl)
                $request.Method = "GET"
                $request.Timeout = 5000
                $response = $request.GetResponse()
                $response.Close()
                
                if ($version -in "Tls", "Tls11") {
                    Write-Host "⚠️  $version is supported (should be disabled)" -ForegroundColor Yellow
                } else {
                    Write-Host "✅ $version is supported" -ForegroundColor Green
                    $supportedVersions += $version
                }
            } catch {
                if ($version -in "Tls", "Tls11") {
                    Write-Host "✅ $version is not supported (good)" -ForegroundColor Green
                } else {
                    Write-Host "❌ $version is not supported" -ForegroundColor Red
                }
            }
        }
        
        # Restore original settings
        [System.Net.ServicePointManager]::SecurityProtocol = $currentProtocols
        
        $script:Report += "TLS Versions: $($supportedVersions -join ', ')"
    } catch {
        Write-Host "❌ Could not check TLS versions: $_" -ForegroundColor Red
        $script:Report += "TLS Versions: UNKNOWN"
    }
}

# Function to generate report
function Generate-Report {
    Write-Host "`n📊 HTTPS Configuration Summary" -ForegroundColor Blue
    Write-Host "==============================" -ForegroundColor Blue
    
    $reportFile = "https_verification_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    
    $reportContent = @"
HTTPS Verification Report for $Domain
Generated: $(Get-Date)
==================================

Test Results:
$($script:Report -join "`n")

Recommendations:
1. Ensure all HTTP traffic is redirected to HTTPS
2. Implement all security headers
3. Disable TLS 1.0 and 1.1
4. Use strong cipher suites only
5. Regularly monitor for mixed content
6. Keep SSL certificate up to date
7. Enable HTTP/2 for better performance
8. Implement certificate pinning for mobile apps

Additional Security Measures:
- Enable OCSP stapling
- Implement DNS CAA records
- Use certificate transparency logs
- Monitor for subdomain takeover
- Regular security audits
"@
    
    $reportContent | Out-File -FilePath $reportFile -Encoding UTF8
    
    Write-Host "`n✅ Report saved to: $reportFile" -ForegroundColor Green
    
    # Display summary
    Write-Host "`nSummary:" -ForegroundColor Yellow
    $script:Report | ForEach-Object {
        if ($_ -like "*PASS*") {
            Write-Host "  $_" -ForegroundColor Green
        } elseif ($_ -like "*WARNING*" -or $_ -like "*PARTIAL*") {
            Write-Host "  $_" -ForegroundColor Yellow
        } elseif ($_ -like "*FAIL*") {
            Write-Host "  $_" -ForegroundColor Red
        } else {
            Write-Host "  $_" -ForegroundColor Gray
        }
    }
}

# Main execution
Write-Host "Starting HTTPS verification for: $BaseUrl" -ForegroundColor Cyan
Write-Host ""

Check-SSLCertificate
Check-HTTPSRedirect
Check-SecurityHeaders
Check-MixedContent
Check-APIEndpoints
Check-TLSVersions
Generate-Report

Write-Host "`n✅ HTTPS verification completed!" -ForegroundColor Green
