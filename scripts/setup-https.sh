#!/bin/bash

# XPSwap HTTPS Development Setup Script
# This script generates self-signed certificates for local HTTPS development

echo "🔒 Setting up HTTPS for XPSwap DEX development..."

# Create certificates directory
mkdir -p certs
cd certs

# Generate private key
echo "📝 Generating private key..."
openssl genrsa -out server.key 2048

# Generate certificate signing request
echo "📄 Creating certificate signing request..."
openssl req -new -key server.key -out server.csr -subj "/C=US/ST=CA/L=San Francisco/O=XPSwap/OU=Development/CN=localhost"

# Generate self-signed certificate
echo "🎫 Generating self-signed certificate..."
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# Create certificate bundle
cat server.crt > server.pem
cat server.key >> server.pem

echo "✅ HTTPS certificates generated successfully!"
echo "📁 Certificates location: $(pwd)"
echo ""
echo "🔧 To use HTTPS in development:"
echo "1. Set HTTPS=true in your .env file"
echo "2. Add SSL_CERT=./certs/server.crt to .env"
echo "3. Add SSL_KEY=./certs/server.key to .env"
echo "4. Trust the certificate in your browser"
echo ""
echo "⚠️  Note: This is a self-signed certificate for development only."
echo "   For production, use certificates from a trusted CA."
