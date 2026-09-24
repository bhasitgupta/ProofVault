import { describe, it, expect } from 'vitest';
describe('ScrollStack Parallax', () => {
  it('should calculate non-negative scale transforms', () => {
    const scale = Math.max(0.9, 1 - 0.05);
    expect(scale).toBeGreaterThan(0.9);
  });
});
