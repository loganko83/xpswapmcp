#!/bin/bash
# HTTPS Configuration Verification Script for XPSwap

echo "🔒 XPSwap HTTPS Configuration Verification"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if domain is provided
if [ -z "$1" ]; then
    DOMAIN="trendy.storydot.kr"
    echo "Using default domain: $DOMAIN"
else
    DOMAIN=$1
fi

BASE_URL="https://$DOMAIN/xpswap"

# Function to check SSL certificate
check_ssl_certificate() {
    echo -e "\n📋 Checking SSL Certificate..."
    
    # Get certificate details
    CERT_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -text 2>/dev/null)
    
    if [ -z "$CERT_INFO" ]; then
        echo -e "${RED}❌ Could not retrieve SSL certificate${NC}"
        return 1
    fi
    
    # Check certificate validity
    CERT_DATES=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    echo "$CERT_DATES"
    
    # Check certificate issuer
    CERT_ISSUER=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null)
    echo "$CERT_ISSUER"
    
    # Check if certificate is valid
    openssl s_client -servername $DOMAIN -connect $DOMAIN:443 </dev/null 2>/dev/null | openssl x509 -checkend 86400 -noout
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSL certificate is valid and not expiring within 24 hours${NC}"
    else
        echo -e "${RED}❌ SSL certificate is expired or expiring soon${NC}"
        return 1
    fi
    
    return 0
}

# Function to check HTTPS redirect
check_https_redirect() {
    echo -e "\n🔄 Checking HTTP to HTTPS redirect..."
    
    # Check if HTTP redirects to HTTPS
    HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "http://$DOMAIN/xpswap")
    REDIRECT_URL=$(curl -s -o /dev/null -w "%{redirect_url}" "http://$DOMAIN/xpswap")
    
    if [[ "$REDIRECT_URL" == https://* ]]; then
        echo -e "${GREEN}✅ HTTP correctly redirects to HTTPS${NC}"
        echo "   Redirect URL: $REDIRECT_URL"
    else
        echo -e "${YELLOW}⚠️  HTTP does not redirect to HTTPS${NC}"
        echo "   Consider implementing automatic HTTPS redirect"
    fi
}

# Function to check security headers
check_security_headers() {
    echo -e "\n🛡️  Checking Security Headers..."
    
    # Get headers
    HEADERS=$(curl -s -I "$BASE_URL")
    
    # Check for important security headers
    declare -A security_headers=(
        ["Strict-Transport-Security"]="HSTS"
        ["X-Content-Type-Options"]="nosniff"
        ["X-Frame-Options"]="Clickjacking protection"
        ["X-XSS-Protection"]="XSS protection"
        ["Content-Security-Policy"]="CSP"
        ["Referrer-Policy"]="Referrer policy"
    )
    
    for header in "${!security_headers[@]}"; do
        if echo "$HEADERS" | grep -qi "^$header:"; then
            HEADER_VALUE=$(echo "$HEADERS" | grep -i "^$header:" | cut -d' ' -f2-)
            echo -e "${GREEN}✅ ${security_headers[$header]}: $header${NC}"
            echo "   Value: $HEADER_VALUE"
        else
            echo -e "${RED}❌ Missing: $header (${security_headers[$header]})${NC}"
        fi
    done
}

# Function to check mixed content
check_mixed_content() {
    echo -e "\n🔍 Checking for Mixed Content..."
    
    # Download the main page
    PAGE_CONTENT=$(curl -s "$BASE_URL")
    
    # Check for HTTP resources
    HTTP_RESOURCES=$(echo "$PAGE_CONTENT" | grep -Eo '(src|href)="http://[^"]*"' | head -5)
    
    if [ -z "$HTTP_RESOURCES" ]; then
        echo -e "${GREEN}✅ No obvious mixed content detected${NC}"
    else
        echo -e "${RED}❌ Potential mixed content found:${NC}"
        echo "$HTTP_RESOURCES"
        echo -e "${YELLOW}Note: This is a basic check. Use browser developer tools for comprehensive analysis.${NC}"
    fi
    
    # Check for protocol-relative URLs
    PROTOCOL_RELATIVE=$(echo "$PAGE_CONTENT" | grep -Eo '(src|href)="//[^"]*"' | head -5)
    if [ ! -z "$PROTOCOL_RELATIVE" ]; then
        echo -e "${YELLOW}⚠️  Found protocol-relative URLs (these should work but consider using HTTPS):${NC}"
        echo "$PROTOCOL_RELATIVE"
    fi
}

# Function to test API endpoints over HTTPS
check_api_endpoints() {
    echo -e "\n🔌 Checking API Endpoints over HTTPS..."
    
    # Test common API endpoints
    declare -a endpoints=(
        "/api/health"
        "/api/xp-price"
        "/api/market-stats"
    )
    
    for endpoint in "${endpoints[@]}"; do
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
        if [ "$RESPONSE" -eq 200 ]; then
            echo -e "${GREEN}✅ $endpoint - Status: $RESPONSE${NC}"
        else
            echo -e "${RED}❌ $endpoint - Status: $RESPONSE${NC}"
        fi
    done
}

# Function to check SSL/TLS version
check_tls_version() {
    echo -e "\n🔐 Checking TLS Version Support..."
    
    # Test different TLS versions
    for version in "tls1" "tls1_1" "tls1_2" "tls1_3"; do
        if openssl s_client -connect $DOMAIN:443 -$version </dev/null 2>/dev/null | grep -q "SSL-Session"; then
            if [[ "$version" == "tls1" || "$version" == "tls1_1" ]]; then
                echo -e "${YELLOW}⚠️  $version is supported (should be disabled for security)${NC}"
            else
                echo -e "${GREEN}✅ $version is supported${NC}"
            fi
        else
            if [[ "$version" == "tls1" || "$version" == "tls1_1" ]]; then
                echo -e "${GREEN}✅ $version is not supported (good for security)${NC}"
            else
                echo -e "${RED}❌ $version is not supported${NC}"
            fi
        fi
    done
}

# Function to check cipher suites
check_cipher_suites() {
    echo -e "\n🔑 Checking Cipher Suites..."
    
    # Get supported ciphers
    CIPHERS=$(openssl s_client -connect $DOMAIN:443 -cipher 'ALL:!EXPORT:!LOW:!MEDIUM' </dev/null 2>/dev/null | grep "Cipher")
    
    if [ ! -z "$CIPHERS" ]; then
        echo "Negotiated cipher suite:"
        echo "$CIPHERS"
        
        # Check for weak ciphers
        WEAK_CIPHERS=$(openssl s_client -connect $DOMAIN:443 -cipher 'EXPORT:LOW:MEDIUM:DES:RC4:MD5' </dev/null 2>/dev/null | grep "Cipher")
        if [ -z "$WEAK_CIPHERS" ]; then
            echo -e "${GREEN}✅ No weak ciphers detected${NC}"
        else
            echo -e "${RED}❌ Weak ciphers detected: $WEAK_CIPHERS${NC}"
        fi
    fi
}

# Function to generate summary report
generate_report() {
    echo -e "\n📊 HTTPS Configuration Summary"
    echo "=============================="
    
    REPORT_FILE="https_verification_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "HTTPS Verification Report for $DOMAIN"
        echo "Generated: $(date)"
        echo "=================================="
        echo ""
        echo "Test Results:"
        echo "- SSL Certificate: $(check_ssl_certificate > /dev/null 2>&1 && echo "PASS" || echo "FAIL")"
        echo "- HTTPS Redirect: $(check_https_redirect > /dev/null 2>&1 && echo "CONFIGURED" || echo "NOT CONFIGURED")"
        echo "- Security Headers: Check individual results above"
        echo "- Mixed Content: Check results above"
        echo "- API Endpoints: Check individual results above"
        echo "- TLS Versions: Check results above"
        echo ""
        echo "Recommendations:"
        echo "1. Ensure all HTTP traffic is redirected to HTTPS"
        echo "2. Implement all security headers"
        echo "3. Disable TLS 1.0 and 1.1"
        echo "4. Use strong cipher suites only"
        echo "5. Regularly monitor for mixed content"
        echo "6. Keep SSL certificate up to date"
    } > "$REPORT_FILE"
    
    echo -e "${GREEN}Report saved to: $REPORT_FILE${NC}"
}

# Main execution
echo "Starting HTTPS verification for: $BASE_URL"
echo ""

check_ssl_certificate
check_https_redirect
check_security_headers
check_mixed_content
check_api_endpoints
check_tls_version
check_cipher_suites
generate_report

echo -e "\n${GREEN}✅ HTTPS verification completed!${NC}"
