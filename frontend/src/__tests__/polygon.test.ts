import { describe, it, expect } from 'vitest';
describe('Polygon Amoy Configuration', () => {
  it('should specify Polygon Amoy chainId 80002', () => {
    const chainIdHex = '0x13882';
    expect(parseInt(chainIdHex, 16)).toBe(80002);
  });
});
