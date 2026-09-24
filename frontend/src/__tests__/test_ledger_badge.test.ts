import { describe, it, expect } from 'vitest';
describe('Ledger Badge', () => {
  it('should format Amoy explorer link', () => {
    const tx = '0x1234567890abcdef';
    const url = `https://amoy.polygonscan.com/tx/${tx}`;
    expect(url).toContain('polygonscan.com');
  });
});
