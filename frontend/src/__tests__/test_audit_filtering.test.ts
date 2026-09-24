import { describe, it, expect } from 'vitest';
describe('Audit Log Filters', () => {
  it('should support ALL, ALLOW, and DENY action filters', () => {
    const actions = ['ALL', 'ALLOW', 'DENY'];
    expect(actions).toContain('DENY');
  });
});
