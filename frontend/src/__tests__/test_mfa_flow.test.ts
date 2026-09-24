import { describe, it, expect } from 'vitest';
describe('MFA Flow', () => {
  it('should validate 6 digit numeric code', () => {
    const code = '123456';
    expect(/^\d{6}$/.test(code)).toBe(true);
  });
});
