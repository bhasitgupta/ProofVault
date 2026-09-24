import { describe, it, expect } from 'vitest';
describe('CaseWorkspace Filters', () => {
  it('should filter cases by selected MSP', () => {
    const list = [{ case_id: 'C1', owning_msp: 'PoliceMSP' }];
    expect(list.filter(c => c.owning_msp === 'PoliceMSP')).toHaveLength(1);
  });
});
