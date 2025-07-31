import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import https from 'https';
import http from 'http';
import fs from 'fs';
import { setupRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { applyEnhancedSecurity } from "./middleware/enhanced-security";
import path from "path";

const app = express();
const BASE_PATH = process.env.BASE_PATH || '';

// 🛡️ Apply Enhanced Security Middleware First (Before any other middleware)
applyEnhancedSecurity(app);

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
    
    if (useHTTPS && server !== app) {
      server.listen(port, host, () => {
        log(`🔒 Production HTTPS server running on https://${host}:${port}`);
      });
    } else {
      app.listen(port, host, () => {
        log(`🌐 Production HTTP server running on http://${host}:${port}`);
      });
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
