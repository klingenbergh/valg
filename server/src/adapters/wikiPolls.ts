import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as cheerio from 'cheerio';

import { getCache } from '../core/cache.js';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const WIKI_BASE = 'https://en.wikipedia.org/wiki/Opinion_polling_for_the_';

export type WikiPoll = {
  year: number;
  date: string; // use publish date or fieldwork end
  pollster?: string;
  sample?: number | null;
  shares: Record<string, number | null>;
};

export async function fetchWikiPolls(year: number): Promise<WikiPoll[] | null> {
  const cache = getCache();
  const url = `${WIKI_BASE}${year}_Norwegian_parliamentary_election`;
  const headers = { 'User-Agent': process.env.WIKI_USER_AGENT || 'valg-app/1.0; (contact admin)' };
  try {
    const res = await axios.get(url, { headers, timeout: 20000, validateStatus: (s) => s < 500 });
    cache.saveRawResponse({
      source: 'Wikipedia',
      key: String(year),
      fetchedAt: new Date().toISOString(),
      status: res.status,
      url,
      body: res.data,
    });
    if (res.status !== 200) return null;

    const $ = cheerio.load(res.data);
    const tables = $('table.wikitable');
    if (!tables.length) return null;

    const polls: WikiPoll[] = [];

    tables.each((_i, tbl) => {
      const headers = $(tbl)
        .find('tr th')
        .map((_j, th) => $(th).text().trim().toLowerCase())
        .get();

      if (!headers.length) return;
      const colIndex: Record<string, number> = {};
      headers.forEach((h, idx) => (colIndex[h] = idx));

      const dateIdx = findHeaderIndex(headers, ['date', 'fieldwork', 'publishing']);
      if (dateIdx < 0) return;

      $(tbl)
        .find('tr')
        .slice(1)
        .each((_r, tr) => {
          const cells = $(tr)
            .find('td,th')
            .map((_k, td) => $(td).text().trim())
            .get();
          if (!cells.length) return;

          const dateText = cells[dateIdx];
          if (!dateText) return;

          const pollsterIdx = findHeaderIndex(headers, ['pollster', 'organisation', 'firm']);
          const pollster = pollsterIdx >= 0 ? cleanText(cells[pollsterIdx]) : undefined;
          const sampleIdx = findHeaderIndex(headers, ['sample', 'n']);
          const sample = sampleIdx >= 0 ? parseSample(cells[sampleIdx]) : null;

          const shares: Record<string, number | null> = {};
          for (let c = 0; c < headers.length; c += 1) {
            const h = headers[c];
            const code = normalizePartyHeader(h);
            if (!code) continue;
            const v = parsePercent(cells[c]);
            shares[code] = v;
          }

          const date = normalizeDate(dateText, year);
          if (!date) return;
          polls.push({ year, date, pollster, sample, shares });
        });
    });

    return polls.length ? polls : null;
  } catch (e) {
    return null;
  }
}

export function findHeaderIndex(headers: string[], candidates: string[]): number {
  const idx = headers.findIndex((h) => candidates.some((c) => h.includes(c)));
  return idx;
}

function cleanText(s: string) {
  return s.replace(/\[[^\]]+\]/g, '').trim();
}

function parseSample(s: string): number | null {
  const m = s.replace(/\D/g, '');
  return m ? Number(m) : null;
}

export function parsePercent(s: string): number | null {
  if (!s) return null;
  const txt = s.replace(/\[[^\]]+\]/g, '').replace(/%/g, '').replace(/,/g, '.').trim();
  if (txt === '' || txt === '—' || txt === '–' || txt === '-') return null;
  const v = Number(txt);
  return Number.isFinite(v) ? v : null;
}

function normalizePartyHeader(h: string): string | null {
  const s = h.toLowerCase();
  const map: Record<string, string> = {
    ap: 'ap', arbeiderpartiet: 'ap',
    h: 'h', høyre: 'h', hoyre: 'h',
    frp: 'frp', 'progress party': 'frp', fremskrittspartiet: 'frp',
    sv: 'sv', 'socialist left': 'sv', 'sosialistisk venstreparti': 'sv',
    sp: 'sp', centre: 'sp', senterpartiet: 'sp',
    v: 'v', venstre: 'v',
    krf: 'krf', christian: 'krf', 'kristelig folkeparti': 'krf',
    mdg: 'mdg', green: 'mdg', 'miljøpartiet de grønne': 'mdg',
    r: 'r', red: 'r', rødt: 'r', rodt: 'r',
    others: 'others', other: 'others',
  } as any;
  for (const [k, v] of Object.entries(map)) {
    if (s.includes(k)) return v;
  }
  return null;
}

export function normalizeDate(txt: string, fallbackYear: number): string | null {
  // Try formats like "1 Sep 2021 – 3 Sep 2021" or "Sep 2021"
  const cleaned = txt.replace(/\(.*?\)/g, '').replace(/\[[^\]]+\]/g, '').trim();
  const m = cleaned.match(/(\d{1,2})\s([A-Za-z]{3,})\s(\d{4})/);
  if (m) {
    const [_, d, month, y] = m;
    const date = new Date(`${d} ${month} ${y}`);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const ym = cleaned.match(/([A-Za-z]{3,})\s(\d{4})/);
  if (ym) {
    const [_, month, y] = ym;
    const date = new Date(`15 ${month} ${y}`);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  if (/\d{4}/.test(cleaned)) return `${fallbackYear}-06-15`;
  return null;
}
