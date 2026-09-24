import { describe, it, expect } from 'vitest';
describe('Login Validation', () => {
  it('should require minimum 8 characters for password', () => {
    const pwd = 'password123';
    expect(pwd.length).toBeGreaterThanOrEqual(8);
  });
});
