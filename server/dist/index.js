// src/index.ts
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

// src/routes/public.ts
import { Router } from "express";

// src/core/cache.ts
import Database from "better-sqlite3";
import NodeCache from "node-cache";
var memoryCache = new NodeCache();
var Cache = class {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = new Database(dbPath);
    this.bootstrap();
  }
  db;
  bootstrap() {
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
  putMemory(key, value, ttlSeconds = 3600) {
    memoryCache.set(key, value, ttlSeconds);
  }
  getMemory(key) {
    return memoryCache.get(key);
  }
  saveRawResponse(params) {
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
  upsertResult(row) {
    const stmt = this.db.prepare(`
      INSERT INTO normalized_results (year, party_id, pct, seats, source)
      VALUES (@year, @partyId, @pct, @seats, @source)
      ON CONFLICT(year, party_id, source) DO UPDATE SET
        pct = excluded.pct,
        seats = excluded.seats
    `);
    stmt.run({ ...row, seats: row.seats ?? null });
  }
  upsertPoll(row) {
    const stmt = this.db.prepare(`
      INSERT INTO normalized_polls (year, date, pollster, party_id, pct, sample, source)
      VALUES (@year, @date, @pollster, @partyId, @pct, @sample, @source)
      ON CONFLICT(year, date, pollster, party_id, source) DO UPDATE SET
        pct = excluded.pct,
        sample = excluded.sample
    `);
    stmt.run({ ...row, pollster: row.pollster ?? null, sample: row.sample ?? null });
  }
  queryResults(year) {
    return this.db.prepare(`SELECT party_id as partyId, pct, seats, source FROM normalized_results WHERE year = ?`).all(year);
  }
  queryPolls(year) {
    return this.db.prepare(
      `SELECT date, pollster, party_id as partyId, pct, sample, source FROM normalized_polls WHERE year = ? ORDER BY date ASC`
    ).all(year);
  }
  distinctYears() {
    const rows = this.db.prepare(`SELECT DISTINCT year FROM normalized_results UNION SELECT DISTINCT year FROM normalized_polls`).all();
    return rows.map((r) => r.year).sort();
  }
  pollDateRange(year) {
    const row = this.db.prepare(`SELECT MIN(date) as min, MAX(date) as max FROM normalized_polls WHERE year = ?`).get(year);
    return row && row.min && row.max ? { from: row.min, to: row.max } : void 0;
  }
  pollSources(year) {
    const rows = this.db.prepare(`SELECT DISTINCT source FROM normalized_polls WHERE year = ?`).all(year);
    return rows.map((r) => r.source);
  }
};
var singleton = null;
var singletonPath = "";
function getCache(dbPath = process.env.SQLITE_PATH || "./data/valg.sqlite") {
  if (!singleton || singletonPath !== dbPath) {
    singleton = new Cache(dbPath);
    singletonPath = dbPath;
  }
  return singleton;
}

// src/core/blocking.ts
function sumBlocks(results, blockDefs, includeOthers = true) {
  const totals = {};
  for (const block of blockDefs) {
    totals[block.name] = 0;
  }
  let others = 0;
  const partyToBlock = /* @__PURE__ */ new Map();
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
  const out = Object.entries(totals).map(([name, pct]) => ({ name, pct }));
  if (includeOthers) out.push({ name: "\xD6vriga", pct: others });
  return out.sort((a, b) => b.pct - a.pct);
}

// ../config/blockmap.json
var blockmap_default = {
  "2009": [
    { year: 2009, name: "R\xF6dgr\xF6n", partyIds: ["ap", "sv", "sp", "r", "mdg"] },
    { year: 2009, name: "Borgerlig", partyIds: ["h", "frp", "v", "krf"] }
  ],
  "2013": [
    { year: 2013, name: "R\xF6dgr\xF6n", partyIds: ["ap", "sv", "sp", "r", "mdg"] },
    { year: 2013, name: "Borgerlig", partyIds: ["h", "frp", "v", "krf"] }
  ],
  "2017": [
    { year: 2017, name: "R\xF6dgr\xF6n", partyIds: ["ap", "sv", "sp", "r", "mdg"] },
    { year: 2017, name: "Borgerlig", partyIds: ["h", "frp", "v", "krf"] }
  ],
  "2021": [
    { year: 2021, name: "R\xF6dgr\xF6n", partyIds: ["ap", "sv", "sp", "r", "mdg"] },
    { year: 2021, name: "Borgerlig", partyIds: ["h", "frp", "v", "krf"] }
  ]
};

// src/routes/public.ts
var router = Router();
var cache = getCache();
router.get("/results", (req, res) => {
  const year = Number(req.query.year);
  if (!Number.isFinite(year)) return res.status(400).json({ error: "Missing year" });
  const rows = cache.queryResults(year);
  const blocks = sumBlocks(
    rows.map((r) => ({ year, partyId: r.partyId, voteSharePct: r.pct, seats: r.seats ?? void 0, meta: { source: r.source, accessedAt: "" } })),
    blockmap_default[String(year)] || []
  );
  return res.json({ year, results: rows.map((r) => ({ party: r.partyId, pct: r.pct, seats: r.seats })), blocks });
});
router.get("/polls", (req, res) => {
  const year = Number(req.query.year);
  const windowDays = req.query.windowDays ? Number(req.query.windowDays) : void 0;
  if (!Number.isFinite(year)) return res.status(400).json({ error: "Missing year" });
  const rows = cache.queryPolls(year);
  const pollsMap = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const key = `${r.date}|${r.pollster ?? ""}`;
    if (!pollsMap.has(key)) pollsMap.set(key, { date: r.date, pollster: r.pollster, parties: [] });
    pollsMap.get(key).parties.push({ party: r.partyId, pct: r.pct });
  }
  const polls = Array.from(pollsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  return res.json({ year, polls, aggregates: {} });
});
router.get("/blocks", (req, res) => {
  const year = Number(req.query.year);
  const type = String(req.query.type || "results");
  if (!Number.isFinite(year)) return res.status(400).json({ error: "Missing year" });
  if (type !== "results" && type !== "polls") return res.status(400).json({ error: "Bad type" });
  if (type === "results") {
    const rows2 = cache.queryResults(year).map((r) => ({ year, partyId: r.partyId, voteSharePct: r.pct, seats: r.seats ?? void 0, meta: { source: r.source, accessedAt: "" } }));
    const blocks2 = sumBlocks(rows2, blockmap_default[String(year)] || []);
    return res.json({ year, blocks: blocks2, mapping: blockmap_default[String(year)] || [] });
  }
  const rows = cache.queryPolls(year);
  const latest = {};
  for (const r of rows) {
    if (r.pct == null) continue;
    latest[r.partyId] = r.pct;
  }
  const results = Object.entries(latest).map(([partyId, pct]) => ({ year, partyId, voteSharePct: pct, meta: { source: "Wikipedia", accessedAt: "" } }));
  const blocks = sumBlocks(results, blockmap_default[String(year)] || []);
  return res.json({ year, blocks, mapping: blockmap_default[String(year)] || [] });
});
router.get("/coverage", (_req, res) => {
  const years = cache.distinctYears();
  const coverage = years.map((y) => ({
    year: y,
    pollsAvailable: cache.queryPolls(y).length > 0,
    range: cache.pollDateRange(y),
    sources: cache.pollSources(y)
  }));
  return res.json({ years, coverage });
});
var public_default = router;

// src/index.ts
var app = express();
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/api", public_default);
var port = Number(process.env.PORT || 3e3);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map