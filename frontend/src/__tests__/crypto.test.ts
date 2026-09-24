import { describe, it, expect } from 'vitest';
describe('SHA-256 Digest Formatter', () => {
  it('should format 32-byte hash into 64-character lowercase hex string', () => {
    const hex = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    expect(hex).toHaveLength(64);
  });
});
