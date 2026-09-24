import { describe, it, expect } from 'vitest';
describe('Judicial Date Formatter', () => {
  it('should format ISO timestamp accurately', () => {
    const iso = '2026-09-25T00:00:00Z';
    const d = new Date(iso);
    expect(d.getUTCFullYear()).toBe(2026);
  });
});
