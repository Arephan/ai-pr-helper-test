import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger, LogLevel, createLogger } from './logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger({ enableConsole: false });
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with default config', () => {
      const defaultLogger = new Logger();
      expect(defaultLogger).toBeInstanceOf(Logger);
    });

    it('should throw error if remote enabled without endpoint', () => {
      expect(() => {
        new Logger({ enableRemote: true });
      }).toThrow('remoteEndpoint is required');
    });

    it('should accept valid remote config', () => {
      const remoteLogger = new Logger({
        enableRemote: true,
        remoteEndpoint: 'https://logs.example.com',
      });
      expect(remoteLogger).toBeInstanceOf(Logger);
    });
  });

  describe('log levels', () => {
    it('should respect minimum log level', () => {
      const infoLogger = new Logger({
        minLevel: LogLevel.INFO,
        enableConsole: false,
      });

      infoLogger.debug('debug message');
      infoLogger.info('info message');

      const logs = infoLogger.getRecentLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('info message');
    });

    it('should log debug messages when minLevel is DEBUG', () => {
      const debugLogger = new Logger({
        minLevel: LogLevel.DEBUG,
        enableConsole: false,
      });

      debugLogger.debug('debug message');
      const logs = debugLogger.getRecentLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
    });
  });

  describe('metadata', () => {
    it('should include metadata in log entries', () => {
      logger.info('test message', { userId: 123, action: 'login' });
      
      const logs = logger.getRecentLogs();
      expect(logs[0].metadata).toEqual({ userId: 123, action: 'login' });
    });

    it('should handle error metadata', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error, { context: 'test' });

      const logs = logger.getRecentLogs();
      expect(logs[0].metadata?.error).toBeDefined();
      expect((logs[0].metadata?.error as any).message).toBe('Test error');
    });
  });

  describe('buffer management', () => {
    it('should maintain recent logs in buffer', () => {
      logger.info('message 1');
      logger.info('message 2');
      logger.info('message 3');

      const logs = logger.getRecentLogs(2);
      expect(logs).toHaveLength(2);
      expect(logs[0].message).toBe('message 2');
      expect(logs[1].message).toBe('message 3');
    });

    it('should clear buffer on request', () => {
      logger.info('message');
      expect(logger.getRecentLogs()).toHaveLength(1);

      logger.clearBuffer();
      expect(logger.getRecentLogs()).toHaveLength(0);
    });

    it('should limit buffer size to MAX_BUFFER_SIZE', () => {
      // Create 150 log entries (exceeds MAX_BUFFER_SIZE of 100)
      for (let i = 0; i < 150; i++) {
        logger.info(`message ${i}`);
      }

      const logs = logger.getRecentLogs(150);
      expect(logs.length).toBeLessThanOrEqual(100);
    });
  });

  describe('configuration updates', () => {
    it('should allow config updates', () => {
      logger.updateConfig({ minLevel: LogLevel.ERROR });
      
      logger.info('info message');
      logger.error('error message');

      const logs = logger.getRecentLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
    });

    it('should validate config on update', () => {
      expect(() => {
        logger.updateConfig({ enableRemote: true });
      }).toThrow('remoteEndpoint is required');
    });
  });

  describe('createLogger factory', () => {
    it('should create logger instance', () => {
      const factoryLogger = createLogger({ serviceName: 'test-service' });
      expect(factoryLogger).toBeInstanceOf(Logger);
    });
  });
});
