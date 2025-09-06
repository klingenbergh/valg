import { BlockDef, Result } from './models.js';

export type BlockTotals = {
  name: string;
  pct: number;
  seats?: number;
};

export function sumBlocks(results: Result[], blockDefs: BlockDef[], includeOthers = true): BlockTotals[] {
  const totals: Record<string, number> = {};

  for (const block of blockDefs) {
    totals[block.name] = 0;
  }

  let others = 0;
  const partyToBlock = new Map<string, string>();
  for (const block of blockDefs) {
    for (const pid of block.partyIds) partyToBlock.set(pid, block.name);
  }

  for (const r of results) {
    const blockName = partyToBlock.get(r.partyId);
    if (blockName) {
      totals[blockName] += r.voteSharePct;
    } else if (includeOthers) {
      others += r.voteSharePct;
    }
  }

  const out: BlockTotals[] = Object.entries(totals).map(([name, pct]) => ({ name, pct }));
  if (includeOthers) out.push({ name: 'Övriga', pct: others });
  return out.sort((a, b) => b.pct - a.pct);
}
