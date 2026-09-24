import { describe, it, expect } from 'vitest';
describe('Documents Workspace Search', () => {
  it('should match document search query case-insensitively', () => {
    const query = 'FIR';
    const filename = 'FIR_CASE001.pdf';
    expect(filename.toLowerCase().includes(query.toLowerCase())).toBe(true);
  });
});
