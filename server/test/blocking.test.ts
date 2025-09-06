import { describe, it, expect } from 'vitest';
import { sumBlocks } from '../src/core/blocking.js';

describe('sumBlocks', () => {
  it('sums parties into blocks with others', () => {
    const results = [
      { year: 2021, partyId: 'ap', voteSharePct: 26.3, meta: { source: 'x', accessedAt: '' } },
      { year: 2021, partyId: 'h', voteSharePct: 20.5, meta: { source: 'x', accessedAt: '' } },
      { year: 2021, partyId: 'pir', voteSharePct: 1.0, meta: { source: 'x', accessedAt: '' } },
    ];
    const blocks = [
      { year: 2021, name: 'Rödgrön', partyIds: ['ap'] },
      { year: 2021, name: 'Borgerlig', partyIds: ['h'] },
    ];

    const out = sumBlocks(results as any, blocks, true);
    expect(out.find((b) => b.name === 'Rödgrön')?.pct).toBeCloseTo(26.3, 1);
    expect(out.find((b) => b.name === 'Borgerlig')?.pct).toBeCloseTo(20.5, 1);
    expect(out.find((b) => b.name === 'Övriga')?.pct).toBeCloseTo(1.0, 1);
  });
});
