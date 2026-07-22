import { describe, it, expect } from 'vitest';
import { inferDataType } from '../utils/typeInference';
import { SENSITIVE_PATTERNS } from '../utils/patterns';

describe('Type Inference', () => {
  it('should infer integer type', () => {
    const values = ['1', '2', '3', '4', '5'];
    expect(inferDataType(values)).toBe('integer');
  });

  it('should infer float type', () => {
    const values = ['1.5', '2.7', '3.14', '4.0'];
    expect(inferDataType(values)).toBe('float');
  });

  it('should infer email type', () => {
    const values = [
      'test@example.com',
      'user@domain.org',
      'admin@company.net',
    ];
    expect(inferDataType(values)).toBe('email');
  });

  it('should infer boolean type', () => {
    const values = ['true', 'false', 'yes', 'no'];
    expect(inferDataType(values)).toBe('boolean');
  });

  it('should infer date type', () => {
    const values = ['2024-01-15', '2024-02-20', '2024-03-10'];
    expect(inferDataType(values)).toBe('date');
  });

  it('should infer string type for mixed data', () => {
    const values = ['abc', 'def', 'ghi'];
    expect(inferDataType(values)).toBe('string');
  });

  it('should handle empty array', () => {
    expect(inferDataType([])).toBe('string');
  });

  it('should handle null values', () => {
    const values = [null, undefined, '', '1', '2', '3'];
    expect(inferDataType(values)).toBe('integer');
  });
});

describe('Sensitive Patterns', () => {
  it('should detect email pattern', () => {
    expect(SENSITIVE_PATTERNS.email.pattern.test('test@example.com')).toBe(true);
    expect(SENSITIVE_PATTERNS.email.pattern.test('invalid-email')).toBe(false);
  });

  it('should detect phone pattern', () => {
    expect(SENSITIVE_PATTERNS.phone.pattern.test('555-123-4567')).toBe(true);
    expect(SENSITIVE_PATTERNS.phone.pattern.test('+1 (555) 123-4567')).toBe(true);
  });

  it('should detect SSN pattern', () => {
    expect(SENSITIVE_PATTERNS.ssn.pattern.test('123-45-6789')).toBe(true);
    expect(SENSITIVE_PATTERNS.ssn.pattern.test('invalid')).toBe(false);
  });

  it('should detect credit card pattern', () => {
    expect(SENSITIVE_PATTERNS.creditCard.pattern.test('1234-5678-9012-3456')).toBe(true);
    expect(SENSITIVE_PATTERNS.creditCard.pattern.test('1234 5678 9012 3456')).toBe(true);
  });
});
