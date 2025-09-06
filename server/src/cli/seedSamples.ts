#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { MemoryCache } from '../core/cacheMemory.js';

// Use in-memory cache for seeding samples without native deps
const cache = new MemoryCache(':memory:');

function seedResults(path: string) {
  const data = JSON.parse(readFileSync(path, 'utf8')) as { year: number; rows: { partyId: string; pct: number; seats?: number }[] };
  for (const r of data.rows) {
    cache.upsertResult({ year: data.year, partyId: r.partyId, pct: r.pct, seats: r.seats ?? null, source: 'sample' });
  }
  process.stdout.write(`seeded results ${data.year}: ${data.rows.length} rows\n`);
}

function seedPolls(path: string) {
  const data = JSON.parse(readFileSync(path, 'utf8')) as { year: number; polls: { date: string; pollster?: string; sample?: number; shares: Record<string, number> }[] };
  for (const p of data.polls) {
    for (const [partyId, pct] of Object.entries(p.shares)) {
      cache.upsertPoll({ year: data.year, date: p.date, pollster: p.pollster ?? null, partyId, pct, sample: p.sample ?? null, source: 'sample' });
    }
  }
  process.stdout.write(`seeded polls ${data.year}: ${data.polls.length} polls\n`);
}

const cmd = process.argv[2];
import path from 'node:path';
const root = path.resolve(process.cwd(), '..');
const resultsPath = path.join(root, 'data/samples/results_2021.json');
const pollsPath = path.join(root, 'data/samples/polls_2021.json');

if (cmd === 'results') seedResults(process.argv[3] || resultsPath);
else if (cmd === 'polls') seedPolls(process.argv[3] || pollsPath);
else {
  seedResults(resultsPath);
  seedPolls(pollsPath);
}
