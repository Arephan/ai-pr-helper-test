/**
 * Structured logging service with severity levels and metadata support
 * @module logger
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  serviceName: string;
}

/**
 * Logger service for structured application logging
 */
export class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 100;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      serviceName: 'app',
      ...config,
    };

    // Validate configuration
    if (this.config.enableRemote && !this.config.remoteEndpoint) {
      throw new Error('remoteEndpoint is required when enableRemote is true');
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const errorMetadata = error
      ? {
          ...metadata,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }
      : metadata;

    this.log(LogLevel.ERROR, message, errorMetadata);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    // Check if log level meets minimum threshold
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      metadata,
    };

    // Add to buffer
    this.buffer.push(entry);
    if (this.buffer.length > this.MAX_BUFFER_SIZE) {
      this.buffer.shift();
    }

    // Console output
    if (this.config.enableConsole) {
      this.writeToConsole(entry);
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.sendToRemote(entry).catch((err) => {
        console.error('Failed to send log to remote:', err);
      });
    }
  }

  /**
   * Write log entry to console
   */
  private writeToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const metadataStr = entry.metadata ? JSON.stringify(entry.metadata) : '';

    const logLine = `[${timestamp}] [${levelName}] [${this.config.serviceName}] ${entry.message} ${metadataStr}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logLine);
        break;
      case LogLevel.INFO:
        console.info(logLine);
        break;
      case LogLevel.WARN:
        console.warn(logLine);
        break;
      case LogLevel.ERROR:
        console.error(logLine);
        break;
    }
  }

  /**
   * Send log entry to remote endpoint
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return;
    }

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          service: this.config.serviceName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Remote logging failed: ${response.status}`);
      }
    } catch (error) {
      // Re-throw to be caught by caller
      throw error;
    }
  }

  /**
   * Get recent log entries from buffer
   */
  getRecentLogs(count: number = 10): LogEntry[] {
    return this.buffer.slice(-count);
  }

  /**
   * Clear the log buffer
   */
  clearBuffer(): void {
    this.buffer = [];
  }

  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };

    // Re-validate
    if (this.config.enableRemote && !this.config.remoteEndpoint) {
      throw new Error('remoteEndpoint is required when enableRemote is true');
    }
  }
}

/**
 * Create a default logger instance
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}
// Testing collapsed comments
// Test collapsed UI
