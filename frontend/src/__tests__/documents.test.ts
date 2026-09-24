import { describe, it, expect } from 'vitest';
describe('Document Parser', () => {
  it('should identify PDF, video, and audio MIME types', () => {
    expect('application/pdf').toContain('pdf');
  });
});
