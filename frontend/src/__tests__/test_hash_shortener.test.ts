import { describe, it, expect } from 'vitest';
describe('Hash Shortener', () => {
  it('should shorten 64-character hash with ellipsis', () => {
    const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const shortened = hash.slice(0, 6) + '...' + hash.slice(-4);
    expect(shortened).toBe('0x1234...cdef');
  });
});
