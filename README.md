## Valg – Polls vs Results

En liten men robust monorepo-app som hämtar norska stortingsvalets resultat och opinionsmätningar, med cache, API och web-UI.

### Snabbstart

```bash
pnpm i
pnpm dev # startar server (3000) + web (5173)
```

### Scripts
- `pnpm dev`: kör server och web parallellt
- `pnpm build`: bygger alla paket
- `pnpm fetch:all`: kör serverns CLI och hämtar data (SSB/Valg + Wikipedia)

### Miljövariabler (.env)
- `PORT=3000`
- `CACHE_TTL_H=12`
- `WIKI_USER_AGENT="ValgDev/1.0 (kontakt: you@example.com)"`
- `SSB_BASEURL=https://api.statbank.no:443/statbank-api-no/en/table`
- `VALG_BASEURL=https://www.valgresultat.no/api`

### Arkitektur
- `server`: Express API + adapters (SSB PxWeb, Valgdirektoratet, Wikipedia)
- `web`: Vite + React + Recharts
- `config/blockmap.json`: standard blockdefinitioner per år (red/green vs borgerlig)
- `data`: rårespons och normaliserad cache i SQLite

Källor och dokumentation:
- SSB StatBank PxWeb API (`https://www.ssb.no/en/statbank`) – se tabeller för stortingsval
- Valgdirektoratet (`https://valgresultat.no`) – API för nyare val
- Wikipedia – sidorna "Opinion polling for the <YEAR> Norwegian parliamentary election"

Etik & licens: appen sparar `SourceMeta` för varje datapunkt och visar källa i UI. Respektera `robots.txt`, använd backoff och begränsa scraping-frekvens.
