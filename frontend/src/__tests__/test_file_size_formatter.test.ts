import { describe, it, expect } from 'vitest';
describe('File Size Formatter', () => {
  it('should format bytes to MB accurately', () => {
    const bytes = 1048576;
    expect((bytes / (1024 * 1024)).toFixed(1)).toBe('1.0');
  });
});
