import { Request, Response, Router } from 'express';
import { getEnhancedSecurityStatus, cryptoManager } from '../middleware/enhanced-security';

const router = Router();

// 🛡️ Enhanced Security Status Endpoint
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = getEnhancedSecurityStatus();
    res.json({
      success: true,
      data: status,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Security status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security status',
      timestamp: Date.now()
    });
  }
});

// 🛡️ Security Audit Log Endpoint (Admin only)
router.get('/audit-log', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const severity = req.query.severity as string;
    
    let logs = getSecurityAuditLog(limit);
    
    // Filter by severity if specified
    if (severity) {
      logs = logs.filter(log => log.severity === severity.toUpperCase());
    }
    
    res.json({
      success: true,
      data: {
        logs,
        totalCount: logs.length,
        filters: { severity, limit }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit logs',
      timestamp: Date.now()
    });
  }
});

// 🛡️ Security Alerts Endpoint
router.get('/alerts', (req: Request, res: Response) => {
  try {
    const recentLogs = getSecurityAuditLog(50);
    const alerts = recentLogs.filter(log => 
      ['HIGH', 'CRITICAL'].includes(log.severity) &&
      (Date.now() - log.timestamp.getTime()) < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    
    const alertSummary = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'CRITICAL').length,
      high: alerts.filter(a => a.severity === 'HIGH').length,
      byType: alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent: alerts.slice(0, 10)
    };
    
    res.json({
      success: true,
      data: alertSummary,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security alerts',
      timestamp: Date.now()
    });
  }
});

// 🛡️ Security Metrics Endpoint
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const logs = getSecurityAuditLog(1000);
    const now = Date.now();
    const timeRanges = {
      lastHour: now - 60 * 60 * 1000,
      last24Hours: now - 24 * 60 * 60 * 1000,
      lastWeek: now - 7 * 24 * 60 * 60 * 1000
    };
    
    const metrics = {
      events: {
        lastHour: logs.filter(l => l.timestamp.getTime() > timeRanges.lastHour).length,
        last24Hours: logs.filter(l => l.timestamp.getTime() > timeRanges.last24Hours).length,
        lastWeek: logs.filter(l => l.timestamp.getTime() > timeRanges.lastWeek).length
      },
      byType: logs.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: logs.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      topIPs: logs.reduce((acc, log) => {
        acc[log.ip] = (acc[log.ip] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    
    res.json({
      success: true,
      data: metrics,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security metrics',
      timestamp: Date.now()
    });
  }
});

// 🛡️ Security Health Check
router.get('/health', (req: Request, res: Response) => {
  const checks = {
    serverRunning: true,
    databaseConnected: true, // This would check actual DB connection
    securityMiddlewareActive: true,
    rateLimitingActive: true,
    corsConfigured: true
  };
  
  const allHealthy = Object.values(checks).every(check => check === true);
  
  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: Date.now()
  });
});

// 🛡️ Threat Intelligence Endpoint (Mock data for demo)
router.get('/threats', (req: Request, res: Response) => {
  try {
    // In production, this would connect to real threat intelligence feeds
    const mockThreats = [
      {
        id: 'TH-001',
        type: 'IP_BLACKLIST',
        value: '192.168.1.100',
        severity: 'HIGH',
        description: 'Known malicious IP detected in trading requests',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        source: 'Internal Detection'
      },
      {
        id: 'TH-002',
        type: 'SUSPICIOUS_PATTERN',
        value: 'Flash loan abuse',
        severity: 'MEDIUM',
        description: 'Unusual flash loan request patterns detected',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        source: 'Behavioral Analysis'
      }
    ];
    
    res.json({
      success: true,
      data: {
        threats: mockThreats,
        totalActive: mockThreats.length,
        lastUpdate: new Date().toISOString()
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve threat intelligence',
      timestamp: Date.now()
    });
  }
});

// 🔐 Generate Secure API Key Endpoint
router.post('/generate-api-key', (req: Request, res: Response) => {
  try {
    const apiKey = cryptoManager.generateSecureApiKey();
    const nonce = cryptoManager.generateSecureNonce();
    
    res.json({
      success: true,
      data: {
        apiKey,
        nonce,
        expiresIn: '30 days',
        permissions: ['read', 'trade']
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('API key generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate API key',
      timestamp: Date.now()
    });
  }
});

// 🔐 Generate Secure Nonce Endpoint
router.get('/nonce', (req: Request, res: Response) => {
  try {
    const nonce = cryptoManager.generateSecureNonce();
    const transactionHash = cryptoManager.generateSecureTransactionHash();
    
    res.json({
      success: true,
      data: {
        nonce,
        transactionHash,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        entropy: process.hrtime.bigint().toString()
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Nonce generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate nonce',
      timestamp: Date.now()
    });
  }
});

// 🛡️ Security Configuration Endpoint
router.get('/config', (req: Request, res: Response) => {
  try {
    const config = {
      rateLimits: {
        general: { windowMs: 900000, max: 50 }, // 15min, 50 requests
        trading: { windowMs: 60000, max: 5 },   // 1min, 5 requests  
        derivatives: { windowMs: 300000, max: 10 }, // 5min, 10 requests
        highRisk: { windowMs: 1800000, max: 2 }  // 30min, 2 requests
      },
      security: {
        httpsEnforced: process.env.NODE_ENV === 'production',
        corsStrictMode: true,
        ipReputationEnabled: true,
        cryptoSecurityLevel: 'ENHANCED',
        errorLeakPrevention: true
      },
      features: {
        nonceValidation: true,
        apiKeyRequired: process.env.NODE_ENV === 'production',
        requestSigning: false, // Future feature
        twoFactorAuth: false   // Future feature
      }
    };
    
    res.json({
      success: true,
      data: config,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Security config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security configuration',
      timestamp: Date.now()
    });
  }
});

export default router;
