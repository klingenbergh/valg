const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('election-data.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS results (
    year INTEGER,
    party_id TEXT,
    pct REAL,
    seats INTEGER,
    source TEXT,
    PRIMARY KEY (year, party_id)
  );
  
  CREATE TABLE IF NOT EXISTS polls (
    year INTEGER,
    date TEXT,
    pollster TEXT,
    party_id TEXT,
    pct REAL,
    sample_size INTEGER,
    source TEXT
  );
  
  CREATE INDEX IF NOT EXISTS idx_polls_year_date ON polls(year, date);
`);

// Serve static files from public directory
app.use(express.static('public'));
app.use(express.json());

// API endpoint for election results
app.get('/api/results', (req, res) => {
  const year = parseInt(req.query.year);
  if (!year) {
    return res.status(400).json({ error: 'Year parameter required' });
  }
  
  const results = db.prepare('SELECT party_id, pct, seats FROM results WHERE year = ? ORDER BY pct DESC').all(year);
  res.json({ year, results });
});

// API endpoint for opinion polls
app.get('/api/polls', (req, res) => {
  const year = parseInt(req.query.year);
  if (!year) {
    return res.status(400).json({ error: 'Year parameter required' });
  }
  
  const polls = db.prepare(`
    SELECT date, pollster, party_id, pct 
    FROM polls 
    WHERE year = ? 
    ORDER BY date DESC, pollster, party_id
  `).all(year);
  
  // Group polls by date and pollster
  const groupedPolls = {};
  polls.forEach(poll => {
    const key = `${poll.date}_${poll.pollster || 'Unknown'}`;
    if (!groupedPolls[key]) {
      groupedPolls[key] = {
        date: poll.date,
        pollster: poll.pollster || 'Unknown',
        parties: {}
      };
    }
    groupedPolls[key].parties[poll.party_id] = poll.pct;
  });
  
  res.json({ 
    year, 
    polls: Object.values(groupedPolls).sort((a, b) => b.date.localeCompare(a.date))
  });
});

// API endpoint for available years
app.get('/api/years', (req, res) => {
  const resultsYears = db.prepare('SELECT DISTINCT year FROM results ORDER BY year DESC').all().map(r => r.year);
  const pollsYears = db.prepare('SELECT DISTINCT year FROM polls ORDER BY year DESC').all().map(r => r.year);
  const allYears = [...new Set([...resultsYears, ...pollsYears])].sort((a, b) => b - a);
  
  res.json({ 
    years: allYears,
    resultsYears,
    pollsYears
  });
});

// API endpoint for party list
app.get('/api/parties', (req, res) => {
  const year = req.query.year ? parseInt(req.query.year) : null;
  let query = 'SELECT DISTINCT party_id FROM (SELECT party_id FROM results UNION SELECT party_id FROM polls)';
  if (year) {
    query = `SELECT DISTINCT party_id FROM (
      SELECT party_id FROM results WHERE year = ${year}
      UNION 
      SELECT party_id FROM polls WHERE year = ${year}
    )`;
  }
  const parties = db.prepare(query).all().map(r => r.party_id).sort();
  res.json({ parties });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});