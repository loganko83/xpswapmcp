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
import path from "path";

// 🔒 Environment Security Validation (First thing to run)
try {
  // 새로운 통합 환경변수 보안 시스템 사용
  initializeEnvironmentSecurity();
  
  // 기존 검증 로직도 유지 (호환성)
  validateEnvironmentVariables();
  validateEnvironmentFormats();
  const secureSecret = ensureSecureSessionSecret();
  process.env.SESSION_SECRET = secureSecret;
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();
const BASE_PATH = process.env.BASE_PATH || '';

// Log environment configuration
console.log('🚀 XPSwap Server Starting...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('BASE_PATH:', BASE_PATH);
console.log('PORT:', process.env.PORT || 5000);

// 🛡️ Apply Enhanced Security Middleware First (Before any other middleware)
applyEnhancedSecurity(app);

// 🔐 Apply Environment Security Middleware
app.use(environmentSecurityMiddleware);

// 📊 Apply Performance Monitoring Middleware
app.use(performanceMonitoringMiddleware);

// 🛡️ Apply XSS Protection Middleware
app.use(createXSSProtectionMiddleware());

app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Serve markdown files as static content
app.use('/DEVELOPERS_GUIDE.md', express.static(path.join(process.cwd(), 'DEVELOPERS_GUIDE.md')));
app.use('/API_REFERENCE.md', express.static(path.join(process.cwd(), 'API_REFERENCE.md')));
app.use('/README.md', express.static(path.join(process.cwd(), 'README.md')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api") || path.startsWith(`${BASE_PATH}/api`)) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup modular routes
  if (BASE_PATH) {
    const router = express.Router();
    setupRoutes(router);
    app.use(BASE_PATH, router);
  } else {
    setupRoutes(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // HTTPS/HTTP Server Setup
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  const useHTTPS = process.env.HTTPS === 'true' && fs.existsSync(process.env.SSL_CERT || '');

  // Create server instance
  let server;
  
  if (useHTTPS) {
    try {
      const options = {
        key: fs.readFileSync(process.env.SSL_KEY || './certs/server.key'),
        cert: fs.readFileSync(process.env.SSL_CERT || './certs/server.crt')
      };
      
      server = https.createServer(options, app);
      log(`🔒 HTTPS Server starting on https://${host}:${port}`);
    } catch (error) {
      log(`⚠️ HTTPS setup failed: ${error.message}. Falling back to HTTP.`);
      server = app;
    }
  } else {
    server = app;
    log(`🌐 HTTP Server starting on http://${host}:${port}`);
  }

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    // Create the server first
    let httpServer;
    if (useHTTPS && server !== app) {
      httpServer = server;
    } else {
      httpServer = http.createServer(app);
    }
    
    // Setup Vite before starting the server
    await setupVite(app, httpServer);
    
    // 📊 Initialize Realtime Monitoring
    try {
      const { default: realtimeMonitor } = await import('./services/realtime-monitor');
      realtimeMonitor.initialize(httpServer);
      console.log('📊 Realtime monitoring initialized');
      
      // Add monitoring dashboard route
      app.get('/monitoring', (req, res) => {
        const path = require('path');
        res.sendFile(path.join(process.cwd(), 'client', 'public', 'monitoring-dashboard.html'));
      });
      console.log('📊 Monitoring dashboard available at /monitoring');
    } catch (error) {
      console.error('📊 Failed to initialize realtime monitoring:', error);
    }
    
    // Now start listening
    httpServer.listen(port, host, () => {
      if (useHTTPS && server !== app) {
        log(`🔒 HTTPS server running on https://${host}:${port}`);
      } else {
        log(`🌐 HTTP server running on http://${host}:${port}`);
      }
    });
  } else {
    serveStatic(app);
    
    // 📊 Initialize Realtime Monitoring for Production
    let productionServer;
    
    if (useHTTPS && server !== app) {
      productionServer = server;
      server.listen(port, host, () => {
        log(`🔒 Production HTTPS server running on https://${host}:${port}`);
      });
    } else {
      productionServer = http.createServer(app);
      productionServer.listen(port, host, () => {
        log(`🌐 Production HTTP server running on http://${host}:${port}`);
      });
    }
    
    // Initialize monitoring after server is created
    try {
      const { default: realtimeMonitor } = await import('./services/realtime-monitor');
      realtimeMonitor.initialize(productionServer);
      console.log('📊 Production realtime monitoring initialized');
      
      // Add monitoring dashboard route for production
      const path = require('path');
      app.get('/xpswap/monitoring', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'client', 'public', 'monitoring-dashboard.html'));
      });
      console.log('📊 Production monitoring dashboard available at /xpswap/monitoring');
    } catch (error) {
      console.error('📊 Failed to initialize production realtime monitoring:', error);
    }
  }

  // Log security status on startup
  setTimeout(() => {
    console.log('🛡️ Enhanced security features activated:');
    console.log('  ✅ Rate limiting enabled');
    console.log('  ✅ IP reputation tracking');
    console.log('  ✅ Advanced crypto security');
    console.log('  ✅ Error leak prevention');
    console.log(`  ${useHTTPS ? '✅' : '⚠️'} HTTPS ${useHTTPS ? 'enabled' : 'disabled (HTTP only)'}`);
    console.log('  ✅ Enhanced CORS protection');
    console.log('  ✅ Security headers enforced');
  }, 1000);
})();
