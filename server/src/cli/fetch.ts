#!/usr/bin/env node
import 'dotenv/config';
import { fetchSsbResults } from '../adapters/ssbStatbank.js';
import { fetchValgResults } from '../adapters/valgresultat.js';
import { fetchWikiPolls } from '../adapters/wikiPolls.js';
import { getCache } from '../core/cache.js';

const cache = getCache();

async function resultsAll(years: number[]) {
  for (const year of years) {
    const ssb = await fetchSsbResults(year);
    const rows = ssb || (await fetchValgResults(year)) || [];
    for (const r of rows) {
      cache.upsertResult({ year, partyId: r.partyId, pct: r.pct, seats: r.seats ?? null, source: ssb ? 'SSB StatBank' : 'Valgdirektoratet' });
    }
    process.stdout.write(`results: ${year} -> ${rows.length} rows\n`);
  }
}

async function pollsAll(years: number[]) {
  for (const year of years) {
    const polls = (await fetchWikiPolls(year)) || [];
    for (const p of polls) {
      for (const [partyId, pct] of Object.entries(p.shares)) {
        cache.upsertPoll({ year, date: p.date, pollster: p.pollster || null, partyId, pct, sample: p.sample ?? null, source: 'Wikipedia' });
      }
    }
    process.stdout.write(`polls: ${year} -> ${polls.length} polls\n`);
  }
}

async function main() {
  const cmd = process.argv[2] || 'all';
  const years = [2009, 2013, 2017, 2021]; // extend later via coverage discovery
  if (cmd === 'results:all' || cmd === 'results') return resultsAll(years);
  if (cmd === 'polls:all' || cmd === 'polls') return pollsAll(years);
  if (cmd === 'all') {
    await resultsAll(years);
    await pollsAll(years);
  }
}

main();
