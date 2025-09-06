import axios from 'axios';
import axiosRetry from 'axios-retry';

import { getCache } from '../core/cache.js';

const VALG_BASEURL = process.env.VALG_BASEURL || 'https://www.valgresultat.no/api';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export type ValgRow = { year: number; partyId: string; pct: number; seats?: number | null };

export async function fetchValgResults(year: number): Promise<ValgRow[] | null> {
  const cache = getCache();
  const url = `${VALG_BASEURL}/2021`; // Placeholder; real endpoints vary per year

  try {
    const res = await axios.get(url, { timeout: 15000, validateStatus: (s) => s < 500 });
    cache.saveRawResponse({
      source: 'Valgdirektoratet',
      key: String(year),
      fetchedAt: new Date().toISOString(),
      status: res.status,
      url,
      body: typeof res.data === 'string' ? res.data : JSON.stringify(res.data),
    });
    if (res.status !== 200) return null;

    const rows: ValgRow[] = [];
    const parties = (res.data?.parties || res.data?.results || []) as any[];
    for (const p of parties) {
      const pct = p.voteShare ?? p.percent ?? p.pct ?? 0;
      const seats = p.seats ?? null;
      const code = String(p.code || p.id || p.party || '').toLowerCase();
      rows.push({ year, partyId: code, pct, seats });
    }
    return rows.length ? rows : null;
  } catch {
    return null;
  }
}
