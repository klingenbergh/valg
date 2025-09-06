import NodeCache from 'node-cache';

export type QueryResultRow = { partyId: string; pct: number; seats: number | null; source: string };
export type QueryPollRow = { date: string; pollster: string | null; partyId: string; pct: number | null; sample: number | null; source: string };

const memoryCache = new NodeCache();

export class MemoryCache {
  private results: Array<{ year: number; partyId: string; pct: number; seats: number | null; source: string }> = [];
  private polls: Array<{ year: number; date: string; pollster: string | null; partyId: string; pct: number | null; sample: number | null; source: string }> = [];

  constructor(_dbPath: string) {}

  putMemory<T>(key: string, value: T, ttlSeconds = 3600) {
    memoryCache.set(key, value, ttlSeconds);
  }

  getMemory<T>(key: string): T | undefined {
    return memoryCache.get<T>(key);
  }

  saveRawResponse(_params: { source: string; key: string; fetchedAt: string; status?: number; url?: string; etag?: string; lastModified?: string; body?: string }) {
    // no-op in memory variant
  }

  upsertResult(row: { year: number; partyId: string; pct: number; seats?: number | null; source: string }) {
    const idx = this.results.findIndex((r) => r.year === row.year && r.partyId === row.partyId && r.source === row.source);
    const obj = { year: row.year, partyId: row.partyId, pct: row.pct, seats: row.seats ?? null, source: row.source };
    if (idx >= 0) this.results[idx] = obj;
    else this.results.push(obj);
  }

  upsertPoll(row: { year: number; date: string; pollster?: string | null; partyId: string; pct: number | null; sample?: number | null; source: string }) {
    const idx = this.polls.findIndex((p) => p.year === row.year && p.date === row.date && (p.pollster || '') === (row.pollster || '') && p.partyId === row.partyId && p.source === row.source);
    const obj = { year: row.year, date: row.date, pollster: row.pollster ?? null, partyId: row.partyId, pct: row.pct, sample: row.sample ?? null, source: row.source };
    if (idx >= 0) this.polls[idx] = obj;
    else this.polls.push(obj);
  }

  queryResults(year: number): QueryResultRow[] {
    return this.results.filter((r) => r.year === year).map((r) => ({ partyId: r.partyId, pct: r.pct, seats: r.seats, source: r.source }));
  }

  queryPolls(year: number): QueryPollRow[] {
    return this.polls
      .filter((p) => p.year === year)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p) => ({ date: p.date, pollster: p.pollster, partyId: p.partyId, pct: p.pct, sample: p.sample, source: p.source }));
  }

  distinctYears() {
    return Array.from(new Set([...this.results.map((r) => r.year), ...this.polls.map((p) => p.year)])).sort();
  }

  pollDateRange(year: number) {
    const dates = this.polls.filter((p) => p.year === year).map((p) => p.date);
    if (!dates.length) return undefined;
    return { from: dates[0], to: dates[dates.length - 1] };
  }

  pollSources(year: number) {
    return Array.from(new Set(this.polls.filter((p) => p.year === year).map((p) => p.source)));
  }
}
