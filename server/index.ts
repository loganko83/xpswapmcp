import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import https from 'https';
import http from 'http';
import fs from 'fs';
import { setupRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { applyEnhancedSecurity } from "./middleware/enhanced-security";
import { 
  validateEnvironmentVariables, 
  ensureSecureSessionSecret, 
  validateEnvironmentFormats,
  sanitizeEnvForLogging 
} from "./middleware/env-validation";
import { initializeEnvironmentSecurity, environmentSecurityMiddleware } from "./middleware/env-security";
import { performanceMonitoringMiddleware } from "./services/api-optimizer";
import { createXSSProtectionMiddleware } from "./services/xss-protection";
import { SecurityKeyGenerator } from "./utils/security-keys";
import path from "path";

// 🔒 Advanced Environment Security Validation (Enhanced v2.0)
try {
  console.log('🔐 Initializing XPSwap Security System v2.0...');
  
  // 새로운 통합 환경변수 보안 시스템 사용
  initializeEnvironmentSecurity();
  
  // 보안 키 검증 (새로운 기능)
  const envValidation = SecurityKeyGenerator.validateEnvironmentSecurity(process.env);
  
  if (!envValidation.isValid) {
    console.error('❌ Security validation failed:');
    envValidation.issues.forEach(issue => console.error(`  - ${issue}`));
    console.log('\n💡 Recommendations:');
    envValidation.recommendations.forEach(rec => console.log(`  - ${rec}`));
    
    if (process.env.NODE_ENV === 'production') {
      console.error('\n🚨 Production environment requires secure configuration!');
      process.exit(1);
    } else {
      console.warn('\n⚠️  Development environment detected. Proceeding with warnings...');
    }
  } else {
    console.log('✅ Environment security validation passed');
  }
  
  // 기존 검증 로직도 유지 (호환성)
  validateEnvironmentVariables();
  validateEnvironmentFormats();
  const secureSecret = ensureSecureSessionSecret();
  process.env.SESSION_SECRET = secureSecret;
  
  // 보안 설정 상태 로깅
  console.log('🛡️  Security Status:');
  console.log(`  - HTTPS: ${process.env.HTTPS === 'true' ? '✅' : '⚠️'}`);
  console.log(`  - Rate Limiting: ${process.env.RATE_LIMIT_ENABLED === 'true' ? '✅' : '⚠️'}`);
  console.log(`  - Error Leak Prevention: ${process.env.ERROR_LEAK_PREVENTION === 'true' ? '✅' : '⚠️'}`);
  console.log(`  - Security Level: ${process.env.SECURITY_LEVEL || 'UNKNOWN'}`);
  console.log(`  - Detailed Errors: ${process.env.DETAILED_ERRORS === 'true' ? '⚠️  (Dev Only)' : '✅'}`);
  
} catch (error) {
  console.error('❌ Environment security initialization failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

const app = express();
const BASE_PATH = process.env.BASE_PATH || '';

// Log environment configuration (sanitized for security)
console.log('\n🚀 XPSwap Server Starting...');
console.log('=====================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('BASE_PATH:', BASE_PATH);
console.log('PORT:', process.env.PORT || 5000);
console.log('HOST:', process.env.HOST || 'localhost');
console.log('XPHERE_RPC_URL:', process.env.XPHERE_RPC_URL);
console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/\/[^\/]*\.db/, '/*****.db')); // Hide DB path
console.log('Config Version:', process.env.CONFIG_VERSION || '1.0');

// 🛡️ Apply Enhanced Security Middleware First (Before any other middleware)
applyEnhancedSecurity(app);

// 🔐 Apply Environment Security Middleware
app.use(environmentSecurityMiddleware);

// 📊 Apply Performance Monitoring Middleware
if (process.env.PERFORMANCE_MONITORING === 'true') {
  app.use(performanceMonitoringMiddleware);
  console.log('✅ Performance monitoring enabled');
}

// 🛡️ Apply XSS Protection
const xssProtection = createXSSProtectionMiddleware();
app.use(xssProtection);

// ⚡ Setup Vite or Static serving
const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  serveStatic(app, BASE_PATH);
  console.log('✅ Static file serving enabled (Production)');
} else {
  await setupVite(app, BASE_PATH);
  console.log('✅ Vite development server enabled');
}

// 🔗 Setup API routes
setupRoutes(app, BASE_PATH);
console.log('✅ API routes configured');

// 🌐 Health check endpoint (enhanced)
app.get(`${BASE_PATH}/api/health`, (req: Request, res: Response) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.CONFIG_VERSION || '1.0',
    environment: process.env.NODE_ENV,
    security_level: process.env.SECURITY_LEVEL,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    },
    features: {
      https: process.env.HTTPS === 'true',
      rate_limiting: process.env.RATE_LIMIT_ENABLED === 'true',
      monitoring: process.env.PERFORMANCE_MONITORING === 'true',
      security_logging: process.env.SECURITY_LOGGING === 'true'
    }
  };

  res.status(200).json(healthStatus);
});

// 🔧 Enhanced error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  // Security logging
  if (process.env.SECURITY_LOGGING === 'true') {
    console.error(`🚨 Error occurred: ${error.message}`);
    console.error(`Request: ${req.method} ${req.path}`);
    console.error(`User-Agent: ${req.get('User-Agent')}`);
    console.error(`IP: ${req.ip}`);
  }

  // Error response based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const shouldShowDetails = process.env.DETAILED_ERRORS === 'true' && isDevelopment;
  
  if (process.env.ERROR_LEAK_PREVENTION === 'true' && !shouldShowDetails) {
    // Production-safe error response
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || 'unknown'
    });
  } else {
    // Development error response with details
    res.status(500).json({
      error: error.message,
      stack: isDevelopment ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || 'unknown'
    });
  }
});

// 🌐 404 handler
app.use((req: Request, res: Response) => {
  if (req.path.startsWith(`${BASE_PATH}/api/`)) {
    res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    // For non-API routes, serve the main app (SPA routing)
    const indexPath = isProduction 
      ? path.join(process.cwd(), 'client/dist/index.html')
      : path.join(process.cwd(), 'client/index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application not found');
    }
  }
});

// 🚀 Server startup
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = process.env.HOST || "localhost";

// SSL/HTTPS support for production
if (process.env.HTTPS === 'true' && process.env.NODE_ENV === 'production') {
  const sslOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH || '/etc/ssl/private/xpswap.key'),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH || '/etc/ssl/certs/xpswap.crt')
  };
  
  const httpsServer = https.createServer(sslOptions, app);
  httpsServer.listen(PORT, HOST, () => {
    console.log('\n🚀 XPSwap HTTPS Server running!');
    console.log(`🔒 https://${HOST}:${PORT}${BASE_PATH}`);
    console.log('=====================================');
  });
  
  // Redirect HTTP to HTTPS
  const httpApp = express();
  httpApp.use((req, res) => {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  });
  const httpServer = http.createServer(httpApp);
  httpServer.listen(80, () => {
    console.log('🔄 HTTP to HTTPS redirect enabled on port 80');
  });
  
} else {
  // HTTP server for development
  const server = http.createServer(app);
  server.listen(PORT, HOST, () => {
    console.log('\n🚀 XPSwap HTTP Server running!');
    console.log(`🌐 http://${HOST}:${PORT}${BASE_PATH}`);
    console.log('=====================================');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📋 Development URLs:');
      console.log(`  - Frontend: http://localhost:5173${BASE_PATH}`);
      console.log(`  - Backend API: http://${HOST}:${PORT}${BASE_PATH}/api`);
      console.log(`  - Health Check: http://${HOST}:${PORT}${BASE_PATH}/api/health`);
    }
  });
}

// 🔄 Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// 💾 Log final startup status
console.log('\n📊 Startup Summary:');
console.log(`✅ Environment: ${process.env.NODE_ENV}`);
console.log(`✅ Security Level: ${process.env.SECURITY_LEVEL}`);
console.log(`✅ Base Path: ${BASE_PATH}`);
console.log(`✅ Config Version: ${process.env.CONFIG_VERSION || '1.0'}`);
console.log('✅ Server initialization complete!');
