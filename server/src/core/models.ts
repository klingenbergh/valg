export type Party = {
  id: string; // canonical id, e.g., "ap"
  code: string; // short code, e.g., "Ap"
  displayName: string; // "Arbeiderpartiet"
  canonicalNames: string[]; // aliases across languages/spellings
};

export type SourceMeta = {
  source: string; // e.g., "SSB StatBank", "Valgdirektoratet", "Wikipedia"
  sourceUrl?: string;
  accessedAt: string; // ISO date-time
  license?: string;
  notes?: string;
};

export type Result = {
  year: number;
  partyId: string;
  voteSharePct: number;
  seats?: number;
  meta: SourceMeta;
};

export type PollPartyShare = {
  partyId: string;
  pct: number | null; // null when missing/others
};

export type Poll = {
  year: number;
  fieldworkDate?: string; // ISO date
  publishDate?: string; // ISO date
  pollster?: string;
  sampleSize?: number | null;
  shares: PollPartyShare[];
  meta: SourceMeta;
};

export type BlockDef = {
  year: number;
  name: string;
  partyIds: string[];
};

export type Coverage = {
  year: number;
  pollsAvailable: boolean;
  range?: { from: string; to: string };
  sources: string[];
};

export type ElectionYear = number;
