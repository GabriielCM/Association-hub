import { describe, it, expect, vi } from 'vitest';
import {
  formatCurrency,
  formatPoints,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  formatPhone,
  generateRandomString,
  delay,
  omit,
  pick,
  isEmpty,
  truncate,
  getInitials,
  capitalize,
  parseApiError,
  clamp,
  formatPercentage,
} from '../utils/index';

// ============================================
// formatCurrency
// ============================================
describe('formatCurrency', () => {
  it('should format positive values in BRL from cents', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('15');
  });

  it('should format zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('should format negative values', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('5');
  });

  it('should handle single digit cents', () => {
    const result = formatCurrency(1);
    expect(result).toContain('0,01');
  });
});

// ============================================
// formatPoints
// ============================================
describe('formatPoints', () => {
  it('should format with thousands separator', () => {
    const result = formatPoints(1500);
    expect(result).toContain('1');
    expect(result).toContain('500');
  });

  it('should format zero', () => {
    expect(formatPoints(0)).toBe('0');
  });

  it('should format large numbers', () => {
    const result = formatPoints(1000000);
    expect(result).toContain('1');
    expect(result).toContain('000');
  });
});

// ============================================
// formatDate
// ============================================
describe('formatDate', () => {
  it('should format Date object to DD/MM/YYYY', () => {
    const result = formatDate(new Date(2024, 0, 15)); // Jan 15, 2024
    expect(result).toBe('15/01/2024');
  });

  it('should format ISO string to DD/MM/YYYY', () => {
    const result = formatDate('2024-06-20T12:00:00Z');
    expect(result).toMatch(/20\/06\/2024/);
  });
});

// ============================================
// formatDateTime
// ============================================
describe('formatDateTime', () => {
  it('should format Date object with time', () => {
    const result = formatDateTime(new Date(2024, 0, 15, 14, 30));
    expect(result).toContain('15/01/2024');
    expect(result).toContain('14:30');
  });

  it('should format ISO string with time', () => {
    const result = formatDateTime('2024-01-15T14:30:00');
    expect(result).toContain('15/01/2024');
  });
});

// ============================================
// formatRelativeDate
// ============================================
describe('formatRelativeDate', () => {
  it('should return "agora mesmo" for recent dates', () => {
    const now = new Date();
    expect(formatRelativeDate(now)).toBe('agora mesmo');
  });

  it('should return minutes for dates < 60 min ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeDate(date)).toBe('há 5 min');
  });

  it('should return hours for dates < 24h ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeDate(date)).toBe('há 3h');
  });

  it('should return "ontem" for yesterday', () => {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(date)).toBe('ontem');
  });

  it('should return days for dates < 7 days ago', () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(date)).toBe('há 3 dias');
  });

  it('should return formatted date for dates >= 7 days ago', () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const result = formatRelativeDate(date);
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('should accept ISO string', () => {
    const result = formatRelativeDate(new Date().toISOString());
    expect(result).toBe('agora mesmo');
  });
});

// ============================================
// formatPhone
// ============================================
describe('formatPhone', () => {
  it('should format 11-digit phone (mobile)', () => {
    expect(formatPhone('11999887766')).toBe('(11) 99988-7766');
  });

  it('should format 10-digit phone (landline)', () => {
    expect(formatPhone('1133445566')).toBe('(11) 3344-5566');
  });

  it('should return original for invalid length', () => {
    expect(formatPhone('123')).toBe('123');
  });

  it('should strip non-digits before formatting', () => {
    expect(formatPhone('(11) 99988-7766')).toBe('(11) 99988-7766');
  });
});

// ============================================
// generateRandomString
// ============================================
describe('generateRandomString', () => {
  it('should return string of correct length', () => {
    expect(generateRandomString(10)).toHaveLength(10);
    expect(generateRandomString(0)).toHaveLength(0);
    expect(generateRandomString(50)).toHaveLength(50);
  });

  it('should only contain alphanumeric characters', () => {
    const result = generateRandomString(100);
    expect(result).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('should return different strings on each call', () => {
    const a = generateRandomString(20);
    const b = generateRandomString(20);
    expect(a).not.toBe(b);
  });
});

// ============================================
// delay
// ============================================
describe('delay', () => {
  it('should resolve after specified ms', async () => {
    vi.useFakeTimers();
    const promise = delay(100);
    vi.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

// ============================================
// omit
// ============================================
describe('omit', () => {
  it('should remove specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
  });

  it('should return same object if no keys to remove', () => {
    const obj = { a: 1, b: 2 };
    expect(omit(obj, [])).toEqual({ a: 1, b: 2 });
  });

  it('should handle removing all keys', () => {
    const obj = { a: 1, b: 2 };
    expect(omit(obj, ['a', 'b'])).toEqual({});
  });

  it('should not mutate original object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    omit(obj, ['b']);
    expect(obj).toEqual({ a: 1, b: 2, c: 3 });
  });
});

// ============================================
// pick
// ============================================
describe('pick', () => {
  it('should pick specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  it('should return empty object for empty keys', () => {
    const obj = { a: 1, b: 2 };
    expect(pick(obj, [])).toEqual({});
  });

  it('should ignore non-existing keys', () => {
    const obj = { a: 1 } as Record<string, unknown>;
    expect(pick(obj, ['a', 'z' as never])).toEqual({ a: 1 });
  });
});

// ============================================
// isEmpty
// ============================================
describe('isEmpty', () => {
  it('should return true for null', () => {
    expect(isEmpty(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return true for empty string', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
  });

  it('should return true for empty array', () => {
    expect(isEmpty([])).toBe(true);
  });

  it('should return true for empty object', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(false)).toBe(false);
  });
});

// ============================================
// truncate
// ============================================
describe('truncate', () => {
  it('should not truncate short text', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('should truncate long text with ellipsis', () => {
    expect(truncate('hello world this is long', 10)).toBe('hello w...');
  });

  it('should handle exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

// ============================================
// getInitials
// ============================================
describe('getInitials', () => {
  it('should get initials from full name', () => {
    expect(getInitials('João Silva')).toBe('JS');
  });

  it('should get single initial from single name', () => {
    expect(getInitials('João')).toBe('J');
  });

  it('should limit to 2 initials', () => {
    expect(getInitials('João Carlos da Silva')).toBe('JC');
  });

  it('should handle extra spaces', () => {
    expect(getInitials('  João   Silva  ')).toBe('JS');
  });

  it('should return uppercase', () => {
    expect(getInitials('joão silva')).toBe('JS');
  });
});

// ============================================
// capitalize
// ============================================
describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should lowercase rest', () => {
    expect(capitalize('HELLO')).toBe('Hello');
  });

  it('should return empty string for empty input', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle single char', () => {
    expect(capitalize('a')).toBe('A');
  });
});

// ============================================
// parseApiError
// ============================================
describe('parseApiError', () => {
  it('should extract message from Error instance', () => {
    expect(parseApiError(new Error('test error'))).toBe('test error');
  });

  it('should return string directly', () => {
    expect(parseApiError('string error')).toBe('string error');
  });

  it('should extract message from object with message property', () => {
    expect(parseApiError({ message: 'obj error' })).toBe('obj error');
  });

  it('should return default message for unknown errors', () => {
    expect(parseApiError(42)).toBe('Erro inesperado. Tente novamente.');
    expect(parseApiError(null)).toBe('Erro inesperado. Tente novamente.');
  });
});

// ============================================
// clamp
// ============================================
describe('clamp', () => {
  it('should return value when in range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('should clamp to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('should clamp to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should handle equal min and max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });
});

// ============================================
// formatPercentage
// ============================================
describe('formatPercentage', () => {
  it('should format without decimals by default', () => {
    expect(formatPercentage(75)).toBe('75%');
  });

  it('should format with specified decimals', () => {
    expect(formatPercentage(75.5, 1)).toBe('75.5%');
    expect(formatPercentage(33.333, 2)).toBe('33.33%');
  });

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0%');
  });

  it('should handle 100', () => {
    expect(formatPercentage(100)).toBe('100%');
  });
});
