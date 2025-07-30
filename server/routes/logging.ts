import { Router } from 'express';
import { logger, LogLevel } from '../utils/logger';

const router = Router();

// Get system logs
router.get('/api/logs', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const level = req.query.level ? parseInt(req.query.level as string) : undefined;
  const category = req.query.category as string;

  let logs;
  if (category) {
    logs = logger.getLogsByCategory(category, limit);
  } else {
    logs = logger.getLogs(limit, level);
  }

  res.json({
    success: true,
    logs,
    totalCount: logs.length,
    timestamp: Date.now()
  });
});

// Get log statistics
router.get('/api/logs/stats', (req, res) => {
  const stats = logger.getStats();
  
  res.json({
    success: true,
    stats,
    timestamp: Date.now()
  });
});

// Test logging (development only)
router.post('/api/logs/test', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Test logging only available in development' });
  }

  const { message, level = 'info', category = 'test' } = req.body;

  switch (level) {
    case 'error':
      logger.error(message, category, req.body.metadata);
      break;
    case 'warn':
      logger.warn(message, category, req.body.metadata);
      break;
    case 'debug':
      logger.debug(message, category, req.body.metadata);
      break;
    case 'trace':
      logger.trace(message, category, req.body.metadata);
      break;
    default:
      logger.info(message, category, req.body.metadata);
  }

  res.json({
    success: true,
    message: 'Log entry created',
    timestamp: Date.now()
  });
});

export default router;
