/**
 * Enhanced Logging System for XPSwap
 * Provides structured logging with different levels and performance tracking
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  category: string;
  metadata?: any;
  userId?: string;
  requestId?: string;
  duration?: number;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = LogLevel.INFO;

  constructor() {
    // Set log level based on environment
    if (process.env.NODE_ENV === 'development') {
      this.currentLevel = LogLevel.DEBUG;
    } else if (process.env.NODE_ENV === 'production') {
      this.currentLevel = LogLevel.WARN;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  private addLog(level: LogLevel, message: string, category: string, metadata?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      category,
      metadata
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      this.consoleOutput(entry);
    }
  }

  private consoleOutput(entry: LogEntry): void {
    const time = new Date(entry.timestamp).toISOString();
    const levelStr = LogLevel[entry.level];
    const msg = `[${time}] ${levelStr} [${entry.category}] ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(msg, entry.metadata || '');
        break;
      case LogLevel.WARN:
        console.warn(msg, entry.metadata || '');
        break;
      case LogLevel.INFO:
        console.info(msg, entry.metadata || '');
        break;
      default:
        console.log(msg, entry.metadata || '');
    }
  }

  error(message: string, category = 'general', metadata?: any): void {
    this.addLog(LogLevel.ERROR, message, category, metadata);
  }

  warn(message: string, category = 'general', metadata?: any): void {
    this.addLog(LogLevel.WARN, message, category, metadata);
  }

  info(message: string, category = 'general', metadata?: any): void {
    this.addLog(LogLevel.INFO, message, category, metadata);
  }

  debug(message: string, category = 'general', metadata?: any): void {
    this.addLog(LogLevel.DEBUG, message, category, metadata);
  }

  trace(message: string, category = 'general', metadata?: any): void {
    this.addLog(LogLevel.TRACE, message, category, metadata);
  }

  // Performance tracking
  startTimer(operation: string, category = 'performance'): number {
    const startTime = Date.now();
    this.debug(`Started: ${operation}`, category, { startTime });
    return startTime;
  }

  endTimer(startTime: number, operation: string, category = 'performance'): number {
    const duration = Date.now() - startTime;
    this.info(`Completed: ${operation}`, category, { duration: `${duration}ms` });
    return duration;
  }

  // Get recent logs
  getLogs(limit = 100, level?: LogLevel): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level !== undefined) {
      filteredLogs = this.logs.filter(log => log.level <= level);
    }
    
    return filteredLogs.slice(-limit).reverse();
  }

  // Get logs by category
  getLogsByCategory(category: string, limit = 50): LogEntry[] {
    return this.logs
      .filter(log => log.category === category)
      .slice(-limit)
      .reverse();
  }

  // Get log statistics
  getStats(): any {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentLogs = this.logs.filter(log => now - log.timestamp < oneHour);
    
    const stats = {
      total: this.logs.length,
      recentHour: recentLogs.length,
      byLevel: {} as any,
      byCategory: {} as any,
      avgLogsPerMinute: Math.round(recentLogs.length / 60)
    };

    // Count by level
    Object.values(LogLevel).forEach(level => {
      if (typeof level === 'number') {
        stats.byLevel[LogLevel[level]] = recentLogs.filter(log => log.level === level).length;
      }
    });

    // Count by category
    recentLogs.forEach(log => {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    return stats;
  }

  // Clear old logs
  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared', 'system');
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
