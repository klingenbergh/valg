import { Router } from 'express';
import { getCache } from '../core/cache.js';
import { sumBlocks } from '../core/blocking.js';
// Bundled via tsup; JSON will be inlined by esbuild
import blockmap from '../../../config/blockmap.json';

const router: Router = Router();
const cache = getCache();

router.get('/results', (req, res) => {
  const year = Number(req.query.year);
  if (!Number.isFinite(year)) return res.status(400).json({ error: 'Missing year' });
  const rows = cache.queryResults(year);
  const blocks = sumBlocks(
    rows.map((r) => ({ year, partyId: r.partyId, voteSharePct: r.pct, seats: r.seats ?? undefined, meta: { source: r.source, accessedAt: '' } })),
    (blockmap as any)[String(year)] || [],
  );

  return res.json({ year, results: rows.map((r) => ({ party: r.partyId, pct: r.pct, seats: r.seats })), blocks });
});

router.get('/polls', (req, res) => {
  const year = Number(req.query.year);
  const windowDays = req.query.windowDays ? Number(req.query.windowDays) : undefined;
  if (!Number.isFinite(year)) return res.status(400).json({ error: 'Missing year' });

  const rows = cache.queryPolls(year);
  // TODO: aggregate window; simple passthrough for now
  const pollsMap = new Map<string, { date: string; pollster: string | null; parties: { party: string; pct: number | null }[] }>();
  for (const r of rows) {
    const key = `${r.date}|${r.pollster ?? ''}`;
    if (!pollsMap.has(key)) pollsMap.set(key, { date: r.date, pollster: r.pollster, parties: [] });
    pollsMap.get(key)!.parties.push({ party: r.partyId, pct: r.pct });
  }
  const polls = Array.from(pollsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return res.json({ year, polls, aggregates: {} });
});

router.get('/blocks', (req, res) => {
  const year = Number(req.query.year);
  const type = String(req.query.type || 'results');
  if (!Number.isFinite(year)) return res.status(400).json({ error: 'Missing year' });
  if (type !== 'results' && type !== 'polls') return res.status(400).json({ error: 'Bad type' });

  if (type === 'results') {
    const rows = cache.queryResults(year).map((r) => ({ year, partyId: r.partyId, voteSharePct: r.pct, seats: r.seats ?? undefined, meta: { source: r.source, accessedAt: '' } }));
    const blocks = sumBlocks(rows, (blockmap as any)[String(year)] || []);
    return res.json({ year, blocks, mapping: (blockmap as any)[String(year)] || [] });
  }
  // For polls, compute last known per party average (placeholder)
  const rows = cache.queryPolls(year);
  const latest: Record<string, number> = {};
  for (const r of rows) {
    if (r.pct == null) continue;
    latest[r.partyId] = r.pct; // naive last sample
  }
  const results = Object.entries(latest).map(([partyId, pct]) => ({ year, partyId, voteSharePct: pct, meta: { source: 'Wikipedia', accessedAt: '' } }));
  const blocks = sumBlocks(results as any, (blockmap as any)[String(year)] || []);
  return res.json({ year, blocks, mapping: (blockmap as any)[String(year)] || [] });
});

router.get('/coverage', (_req, res) => {
  const years = cache.distinctYears();
  const coverage = years.map((y) => ({
    year: y,
    pollsAvailable: cache.queryPolls(y).length > 0,
    range: cache.pollDateRange(y),
    sources: cache.pollSources(y),
  }));
  return res.json({ years, coverage });
});

export default router;
