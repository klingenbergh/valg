import Database from 'better-sqlite3';
import NodeCache from 'node-cache';

const memoryCache = new NodeCache();

export class SqliteCache {
  private db: Database.Database;
  constructor(private dbPath: string) {
    this.db = new Database(dbPath);
    this.bootstrap();
  }

  private bootstrap() {
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS raw_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL,
        key TEXT NOT NULL,
        fetched_at TEXT NOT NULL,
        status INTEGER,
        url TEXT,
        etag TEXT,
        last_modified TEXT,
        body TEXT
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_raw_source_key ON raw_responses(source, key);

      CREATE TABLE IF NOT EXISTS normalized_results (
        year INTEGER NOT NULL,
        party_id TEXT NOT NULL,
        pct REAL NOT NULL,
        seats INTEGER,
        source TEXT NOT NULL,
        PRIMARY KEY (year, party_id, source)
      );

      CREATE TABLE IF NOT EXISTS normalized_polls (
        year INTEGER NOT NULL,
        date TEXT NOT NULL,
        pollster TEXT,
        party_id TEXT NOT NULL,
        pct REAL,
        sample INTEGER,
        source TEXT NOT NULL,
        PRIMARY KEY (year, date, pollster, party_id, source)
      );
    `);
  }

  putMemory<T>(key: string, value: T, ttlSeconds = 3600) {
    memoryCache.set(key, value, ttlSeconds);
  }

  getMemory<T>(key: string): T | undefined {
    return memoryCache.get<T>(key);
  }

  saveRawResponse(params: {
    source: string;
    key: string;
    fetchedAt: string;
    status?: number;
    url?: string;
    etag?: string;
    lastModified?: string;
    body?: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO raw_responses (source, key, fetched_at, status, url, etag, last_modified, body)
      VALUES (@source, @key, @fetchedAt, @status, @url, @etag, @lastModified, @body)
      ON CONFLICT(source, key) DO UPDATE SET
        fetched_at = excluded.fetched_at,
        status = excluded.status,
        url = excluded.url,
        etag = excluded.etag,
        last_modified = excluded.last_modified,
        body = excluded.body
    `);
    stmt.run(params);
  }

  upsertResult(row: { year: number; partyId: string; pct: number; seats?: number | null; source: string }) {
    const stmt = this.db.prepare(`
      INSERT INTO normalized_results (year, party_id, pct, seats, source)
      VALUES (@year, @partyId, @pct, @seats, @source)
      ON CONFLICT(year, party_id, source) DO UPDATE SET
        pct = excluded.pct,
        seats = excluded.seats
    `);
    stmt.run({ ...row, seats: row.seats ?? null });
  }

  upsertPoll(row: {
    year: number;
    date: string;
    pollster?: string | null;
    partyId: string;
    pct: number | null;
    sample?: number | null;
    source: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO normalized_polls (year, date, pollster, party_id, pct, sample, source)
      VALUES (@year, @date, @pollster, @partyId, @pct, @sample, @source)
      ON CONFLICT(year, date, pollster, party_id, source) DO UPDATE SET
        pct = excluded.pct,
        sample = excluded.sample
    `);
    stmt.run({ ...row, pollster: row.pollster ?? null, sample: row.sample ?? null });
  }

  queryResults(year: number) {
    return this.db
      .prepare(`SELECT party_id as partyId, pct, seats, source FROM normalized_results WHERE year = ?`)
      .all(year) as Array<{ partyId: string; pct: number; seats: number | null; source: string }>;
  }

  queryPolls(year: number) {
    return this.db
      .prepare(
        `SELECT date, pollster, party_id as partyId, pct, sample, source FROM normalized_polls WHERE year = ? ORDER BY date ASC`,
      )
      .all(year) as Array<{ date: string; pollster: string | null; partyId: string; pct: number | null; sample: number | null; source: string }>;
  }

  distinctYears() {
    const rows = this.db.prepare(`SELECT DISTINCT year FROM normalized_results UNION SELECT DISTINCT year FROM normalized_polls`).all() as Array<{ year: number }>;
    return rows.map((r) => r.year).sort();
  }

  pollDateRange(year: number) {
    const row = this.db.prepare(`SELECT MIN(date) as min, MAX(date) as max FROM normalized_polls WHERE year = ?`).get(year) as { min: string | null; max: string | null };
    return row && row.min && row.max ? { from: row.min, to: row.max } : undefined;
  }

  pollSources(year: number) {
    const rows = this.db.prepare(`SELECT DISTINCT source FROM normalized_polls WHERE year = ?`).all(year) as Array<{ source: string }>;
    return rows.map((r) => r.source);
  }
}
