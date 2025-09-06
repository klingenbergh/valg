import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Line, LineChart, Tooltip, XAxis, YAxis, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

const YEARS = [2009, 2013, 2017, 2021];

type ResultRow = { party: string; pct: number; seats?: number | null };

type ResultsResponse = { year: number; results: ResultRow[] };

type PollsResponse = {
  year: number;
  polls: { date: string; pollster: string | null; parties: { party: string; pct: number | null }[] }[];
};

export function App() {
  const [year, setYear] = useState<number>(2021);
  const [results, setResults] = useState<ResultsResponse | null>(null);
  const [polls, setPolls] = useState<PollsResponse | null>(null);

  useEffect(() => {
    (async () => {
      const r = await axios.get<ResultsResponse>(`/api/results?year=${year}`);
      setResults(r.data);
      const p = await axios.get<PollsResponse>(`/api/polls?year=${year}&windowDays=42`);
      setPolls(p.data);
    })();
  }, [year]);

  const parties = useMemo(() => {
    const set = new Set<string>();
    results?.results.forEach((r) => set.add(r.party));
    polls?.polls.forEach((p) => p.parties.forEach((pp) => pp.pct != null && set.add(pp.party)));
    return Array.from(set);
  }, [results, polls]);

  const timeseries = useMemo(() => {
    const map = new Map<string, any>();
    polls?.polls.forEach((p) => {
      const obj = map.get(p.date) || { date: p.date };
      p.parties.forEach((pp) => {
        if (pp.pct != null) obj[pp.party] = pp.pct;
      });
      map.set(p.date, obj);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [polls]);

  return (
    <div className="container py-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Valg – mätningar vs resultat</h1>
        <select className="border rounded px-2 py-1" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <h2 className="font-medium mb-2">Partier: mätningar över tid</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeseries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 40]} unit="%" />
              <Tooltip />
              <Legend />
              {parties.map((p) => (
                <Line key={p} type="monotone" dataKey={p} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-medium mb-2">Valnattens resultat</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {results?.results.map((r) => (
            <li key={r.party} className="border rounded p-2 flex justify-between">
              <span className="font-medium">{r.party.toUpperCase()}</span>
              <span>{r.pct.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
