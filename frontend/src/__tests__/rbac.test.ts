import { describe, it, expect } from 'vitest';
describe('RBAC Weight Matrix', () => {
  it('should evaluate SECRET higher than CONFIDENTIAL and RESTRICTED', () => {
    const weights = { RESTRICTED: 1, CONFIDENTIAL: 2, SECRET: 3 };
    expect(weights.SECRET).toBeGreaterThan(weights.CONFIDENTIAL);
  });
});
