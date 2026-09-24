import { describe, it, expect } from 'vitest';
describe('TOTP Code Sanitizer', () => {
  it('should strip non-numeric characters from MFA input', () => {
    const raw = '123-456 ';
    expect(raw.replace(/\D/g, '')).toBe('123456');
  });
});
