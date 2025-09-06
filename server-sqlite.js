const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('election.db');

// Initialize database tables
db.serialize(() => {
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS results (
      year INTEGER,
      party_id TEXT,
      pct REAL,
      seats INTEGER,
      source TEXT,
      PRIMARY KEY (year, party_id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS polls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER,
      date TEXT,
      pollster TEXT,
      party_id TEXT,
      pct REAL,
      sample_size INTEGER,
      source TEXT
    )
  `);
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_polls_year_date ON polls(year, date)`);
  
  // Check if we have data
  db.get("SELECT COUNT(*) as count FROM results", (err, row) => {
    if (row.count === 0) {
      console.log('Inserting sample election results...');
      insertSampleData();
    }
  });
});

// Insert sample election results
function insertSampleData() {
  const sampleResults = [
    // 2021 Election
    { year: 2021, party_id: 'Ap', pct: 26.3, seats: 48 },
    { year: 2021, party_id: 'H', pct: 20.4, seats: 36 },
    { year: 2021, party_id: 'Sp', pct: 13.5, seats: 28 },
    { year: 2021, party_id: 'FrP', pct: 11.6, seats: 21 },
    { year: 2021, party_id: 'SV', pct: 7.6, seats: 13 },
    { year: 2021, party_id: 'R', pct: 4.7, seats: 8 },
    { year: 2021, party_id: 'V', pct: 4.6, seats: 8 },
    { year: 2021, party_id: 'MDG', pct: 3.9, seats: 3 },
    { year: 2021, party_id: 'KrF', pct: 3.8, seats: 3 },
    { year: 2021, party_id: 'PF', pct: 0.2, seats: 1 },
    
    // 2017 Election
    { year: 2017, party_id: 'Ap', pct: 27.4, seats: 49 },
    { year: 2017, party_id: 'H', pct: 25.0, seats: 45 },
    { year: 2017, party_id: 'FrP', pct: 15.2, seats: 27 },
    { year: 2017, party_id: 'Sp', pct: 10.3, seats: 19 },
    { year: 2017, party_id: 'SV', pct: 6.0, seats: 11 },
    { year: 2017, party_id: 'V', pct: 4.4, seats: 8 },
    { year: 2017, party_id: 'KrF', pct: 4.2, seats: 8 },
    { year: 2017, party_id: 'MDG', pct: 3.2, seats: 1 },
    { year: 2017, party_id: 'R', pct: 2.4, seats: 1 },
    
    // 2013 Election
    { year: 2013, party_id: 'Ap', pct: 30.8, seats: 55 },
    { year: 2013, party_id: 'H', pct: 26.8, seats: 48 },
    { year: 2013, party_id: 'FrP', pct: 16.3, seats: 29 },
    { year: 2013, party_id: 'KrF', pct: 5.6, seats: 10 },
    { year: 2013, party_id: 'Sp', pct: 5.5, seats: 10 },
    { year: 2013, party_id: 'V', pct: 5.2, seats: 9 },
    { year: 2013, party_id: 'SV', pct: 4.1, seats: 7 },
    { year: 2013, party_id: 'MDG', pct: 2.8, seats: 1 },
    
    // 2009 Election
    { year: 2009, party_id: 'Ap', pct: 35.4, seats: 64 },
    { year: 2009, party_id: 'FrP', pct: 22.9, seats: 41 },
    { year: 2009, party_id: 'H', pct: 17.2, seats: 30 },
    { year: 2009, party_id: 'SV', pct: 6.2, seats: 11 },
    { year: 2009, party_id: 'Sp', pct: 6.2, seats: 11 },
    { year: 2009, party_id: 'KrF', pct: 5.5, seats: 10 },
    { year: 2009, party_id: 'V', pct: 3.9, seats: 2 },
    
    // 2005 Election
    { year: 2005, party_id: 'Ap', pct: 32.7, seats: 61 },
    { year: 2005, party_id: 'FrP', pct: 22.1, seats: 38 },
    { year: 2005, party_id: 'H', pct: 14.1, seats: 23 },
    { year: 2005, party_id: 'SV', pct: 8.8, seats: 15 },
    { year: 2005, party_id: 'KrF', pct: 6.8, seats: 11 },
    { year: 2005, party_id: 'Sp', pct: 6.5, seats: 11 },
    { year: 2005, party_id: 'V', pct: 5.9, seats: 10 },
    
    // 2001 Election
    { year: 2001, party_id: 'Ap', pct: 24.3, seats: 43 },
    { year: 2001, party_id: 'H', pct: 21.2, seats: 38 },
    { year: 2001, party_id: 'FrP', pct: 14.6, seats: 26 },
    { year: 2001, party_id: 'SV', pct: 12.5, seats: 23 },
    { year: 2001, party_id: 'KrF', pct: 12.4, seats: 22 },
    { year: 2001, party_id: 'Sp', pct: 5.6, seats: 10 },
    { year: 2001, party_id: 'V', pct: 3.9, seats: 2 }
  ];
  
  const stmt = db.prepare("INSERT OR REPLACE INTO results (year, party_id, pct, seats, source) VALUES (?, ?, ?, ?, ?)");
  sampleResults.forEach(r => {
    stmt.run(r.year, r.party_id, r.pct, r.seats, 'Historical Data');
  });
  stmt.finalize();
}

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// API: Get election results
app.get('/api/results', (req, res) => {
  const year = parseInt(req.query.year) || 2021;
  
  db.all(
    "SELECT party_id, pct, seats FROM results WHERE year = ? ORDER BY pct DESC",
    [year],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ year, results: rows });
      }
    }
  );
});

// API: Get opinion polls for an election year
app.get('/api/polls', (req, res) => {
  const electionYear = parseInt(req.query.year) || 2021;
  
  // Get the previous election year to set the date range
  db.get(
    `SELECT MAX(year) as prev_year FROM results WHERE year < ?`,
    [electionYear],
    (err, prevElection) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Set date range: from day after previous election to election day
      const startYear = prevElection?.prev_year ? prevElection.prev_year : electionYear - 4;
      const startDate = `${startYear}-09-15`; // Day after typical election day
      // For 2025, include all future polls since we don't have an election date yet
      const endDate = electionYear === 2025 ? '2025-12-31' : `${electionYear}-09-14`;
      
      // Get all polls in this date range
      db.all(
        `SELECT date, pollster, party_id, pct 
         FROM polls 
         WHERE date > ? AND date <= ?
         ORDER BY date DESC, pollster, party_id`,
        [startDate, endDate],
        (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          // Group by date and pollster
          const pollsMap = {};
          rows.forEach(row => {
            const key = `${row.date}_${row.pollster || 'Unknown'}`;
            if (!pollsMap[key]) {
              pollsMap[key] = {
                date: row.date,
                pollster: row.pollster || 'Unknown',
                parties: {}
              };
            }
            pollsMap[key].parties[row.party_id] = row.pct;
          });
          
          const polls = Object.values(pollsMap).sort((a, b) => b.date.localeCompare(a.date));
          res.json({ year: electionYear, polls });
        }
      );
    }
  );
});

// API: Get available years
app.get('/api/years', (req, res) => {
  db.all(
    `SELECT DISTINCT year FROM results ORDER BY year DESC`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ years: rows.map(r => r.year) });
      }
    }
  );
});

// API: Get all parties
app.get('/api/parties', (req, res) => {
  const year = req.query.year;
  let query = `SELECT DISTINCT party_id FROM (
    SELECT party_id FROM results 
    UNION 
    SELECT party_id FROM polls
  )`;
  
  if (year) {
    query = `SELECT DISTINCT party_id FROM (
      SELECT party_id FROM results WHERE year = ${year}
      UNION 
      SELECT party_id FROM polls WHERE year = ${year}
    )`;
  }
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ parties: rows.map(r => r.party_id).sort() });
    }
  });
});

// API: Get statistics
app.get('/api/stats', (req, res) => {
  db.all(
    `SELECT 
      (SELECT COUNT(DISTINCT year) FROM results) as election_years,
      (SELECT COUNT(DISTINCT year || '_' || date || '_' || pollster) FROM polls) as total_polls,
      (SELECT MIN(year) FROM results) as first_year,
      (SELECT MAX(year) FROM results) as last_year`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows[0]);
      }
    }
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
================================================
Server running at http://localhost:${PORT}
================================================

The database includes historical election results from 2001-2021.
To add opinion poll data, run: node fetch-polls.js

Available endpoints:
- /api/results?year=2021
- /api/polls?year=2021
- /api/years
- /api/parties
- /api/stats
`);
});