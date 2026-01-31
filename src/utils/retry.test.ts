import { describe, it, expect, vi } from 'vitest';
import { retry, isRetryableError } from './retry';

describe('retry', () => {
  it('should return result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retry(fn);
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');
    
    const result = await retry(fn, { maxAttempts: 3, delayMs: 10 });
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('permanent failure'));
    
    await expect(
      retry(fn, { maxAttempts: 2, delayMs: 10 })
    ).rejects.toThrow('permanent failure');
    
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn();
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    await retry(fn, { maxAttempts: 2, delayMs: 10, onRetry });
    
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1);
  });

  it('should apply exponential backoff', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');
    
    const start = Date.now();
    await retry(fn, { 
      maxAttempts: 3, 
      delayMs: 100, 
      backoffMultiplier: 2 
    });
    const elapsed = Date.now() - start;
    
    // First retry: 100ms, second retry: 200ms = ~300ms total
    expect(elapsed).toBeGreaterThan(280);
    expect(elapsed).toBeLessThan(400);
  });

  it('should respect maxDelayMs', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    const start = Date.now();
    await retry(fn, { 
      maxAttempts: 2, 
      delayMs: 1000, 
      backoffMultiplier: 10,
      maxDelayMs: 50
    });
    const elapsed = Date.now() - start;
    
    // Delay capped at 50ms
    expect(elapsed).toBeLessThan(100);
  });
});

describe('isRetryableError', () => {
  it('should identify network errors as retryable', () => {
    expect(isRetryableError(new Error('ECONNRESET'))).toBe(true);
    expect(isRetryableError(new Error('ETIMEDOUT'))).toBe(true);
    expect(isRetryableError(new Error('Network timeout'))).toBe(true);
  });

  it('should identify rate limit errors as retryable', () => {
    expect(isRetryableError(new Error('Rate limit exceeded'))).toBe(true);
  });

  it('should not identify other errors as retryable', () => {
    expect(isRetryableError(new Error('Invalid input'))).toBe(false);
    expect(isRetryableError(new Error('Not found'))).toBe(false);
  });

  it('should handle non-Error objects', () => {
    expect(isRetryableError('string error')).toBe(false);
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
  });
});
