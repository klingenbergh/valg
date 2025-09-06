import axios from 'axios';
import axiosRetry from 'axios-retry';
import { z } from 'zod';

import { getCache } from '../core/cache.js';

const SSB_BASEURL = process.env.SSB_BASEURL || 'https://api.statbank.no:443/statbank-api-no/en/table';

// SSB PxWeb API: we will call specific table ids for parliamentary elections
// Example table (English) often used: 07779 (Votes by party?). Exact ids may differ; handle via config.

const PxResponseSchema = z.object({
  columns: z.array(z.object({ code: z.string(), text: z.string() })),
  data: z.array(
    z.object({
      key: z.array(z.string()),
      values: z.array(z.string()),
    }),
  ),
});

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export type SsbResultRow = { year: number; partyId: string; pct: number; seats?: number | null };

export async function fetchSsbResults(year: number): Promise<SsbResultRow[] | null> {
  const cache = getCache();
  const tableId = inferTableIdForYear(year);
  if (!tableId) return null;

  const url = `${SSB_BASEURL}/${tableId}`;

  const body = {
    table: tableId,
    // Query: dimensions differ by table; aim for party and year at national level
    // Using a generic approach: select all parties, filter year
    // Example PxWeb POST structure
    query: [
      { code: 'Krets', selection: { filter: 'item', values: ['0'] } },
      { code: 'Parti', selection: { filter: 'all', values: ['*'] } },
      { code: 'ContentsCode', selection: { filter: 'item', values: ['ProsentvisOppslutning'] } },
      { code: 'Aar', selection: { filter: 'item', values: [String(year)] } },
    ],
    response: { format: 'JSON' },
  } as any;

  try {
    const res = await axios.post(url, body, {
      headers: {
        'User-Agent': process.env.WIKI_USER_AGENT || 'valg-app/1.0 (contact admin)'.slice(0, 120),
      },
      timeout: 20000,
      validateStatus: (s) => s < 500,
    });
    cache.saveRawResponse({
      source: 'SSB StatBank',
      key: String(year),
      fetchedAt: new Date().toISOString(),
      status: res.status,
      url,
      body: typeof res.data === 'string' ? res.data : JSON.stringify(res.data),
    });
    if (res.status !== 200) return null;

    const parsed = PxResponseSchema.safeParse(res.data);
    if (!parsed.success) return null;

    // Simplistic normalization: find party code and value columns
    const data = parsed.data.data;
    const rows: SsbResultRow[] = [];
    for (const d of data) {
      const values = d.values.map((v) => (v === '..' || v === '.' ? null : Number(v.replace(',', '.'))));
      const partyId = d.key.find((k) => /[A-Za-z]/.test(k)) || 'unknown';
      const pct = values[0] ?? 0;
      rows.push({ year, partyId: normalizePartyId(partyId), pct });
    }
    return rows;
  } catch (err) {
    return null;
  }
}

function inferTableIdForYear(year: number): string | null {
  // Placeholder mapping; should be refined with exact SSB tables for parliamentary results by party and year.
  // Commonly used Px tables: 07779, 07784, 12925 etc. We'll default to null if unknown.
  if (year >= 1945 && year <= 2021) return '07779';
  return null;
}

function normalizePartyId(raw: string): string {
  const s = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const map: Record<string, string> = {
    ap: 'ap', arbeiderpartiet: 'ap', 'a.p.': 'ap',
    h: 'h', hoyre: 'h', hoeyre: 'h',
    frp: 'frp', fremskrittspartiet: 'frp', 'fr.p.': 'frp',
    sv: 'sv', sosialistisk: 'sv', 'sosialistisk venstreparti': 'sv',
    sp: 'sp', senterpartiet: 'sp',
    v: 'v', venstre: 'v',
    krf: 'krf', 'kristelig folkeparti': 'krf', 'kr.f.': 'krf',
    mdg: 'mdg', 'miljopartiet de gronne': 'mdg', 'green party': 'mdg',
    r: 'r', rodt: 'r', red: 'r',
  } as any;
  return map[s] || s.replace(/[^a-z]/g, '');
}
