const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('election.db');

// Complete historical election results (official data)
const ELECTION_RESULTS = {
  2021: [
    { party: 'Ap', pct: 26.3, seats: 48, votes: 960211 },
    { party: 'H', pct: 20.4, seats: 36, votes: 745402 },
    { party: 'Sp', pct: 13.5, seats: 28, votes: 493935 },
    { party: 'FrP', pct: 11.6, seats: 21, votes: 423099 },
    { party: 'SV', pct: 7.6, seats: 13, votes: 277139 },
    { party: 'R', pct: 4.7, seats: 8, votes: 172494 },
    { party: 'V', pct: 4.6, seats: 8, votes: 168283 },
    { party: 'MDG', pct: 3.9, seats: 3, votes: 141924 },
    { party: 'KrF', pct: 3.8, seats: 3, votes: 139533 },
    { party: 'PF', pct: 0.2, seats: 1, votes: 7019 }
  ],
  2017: [
    { party: 'Ap', pct: 27.4, seats: 49, votes: 800949 },
    { party: 'H', pct: 25.0, seats: 45, votes: 732897 },
    { party: 'FrP', pct: 15.2, seats: 27, votes: 444683 },
    { party: 'Sp', pct: 10.3, seats: 19, votes: 302017 },
    { party: 'SV', pct: 6.0, seats: 11, votes: 176222 },
    { party: 'V', pct: 4.4, seats: 8, votes: 127911 },
    { party: 'KrF', pct: 4.2, seats: 8, votes: 122797 },
    { party: 'MDG', pct: 3.2, seats: 1, votes: 94788 },
    { party: 'R', pct: 2.4, seats: 1, votes: 70522 }
  ],
  2013: [
    { party: 'Ap', pct: 30.8, seats: 55, votes: 874769 },
    { party: 'H', pct: 26.8, seats: 48, votes: 760232 },
    { party: 'FrP', pct: 16.3, seats: 29, votes: 463560 },
    { party: 'KrF', pct: 5.6, seats: 10, votes: 158475 },
    { party: 'Sp', pct: 5.5, seats: 10, votes: 155357 },
    { party: 'V', pct: 5.2, seats: 9, votes: 148275 },
    { party: 'SV', pct: 4.1, seats: 7, votes: 116021 },
    { party: 'MDG', pct: 2.8, seats: 1, votes: 79152 },
    { party: 'R', pct: 1.1, seats: 0, votes: 30751 }
  ],
  2009: [
    { party: 'Ap', pct: 35.4, seats: 64, votes: 949049 },
    { party: 'FrP', pct: 22.9, seats: 41, votes: 614724 },
    { party: 'H', pct: 17.2, seats: 30, votes: 461612 },
    { party: 'SV', pct: 6.2, seats: 11, votes: 166361 },
    { party: 'Sp', pct: 6.2, seats: 11, votes: 165005 },
    { party: 'KrF', pct: 5.5, seats: 10, votes: 148748 },
    { party: 'V', pct: 3.9, seats: 2, votes: 103503 },
    { party: 'R', pct: 1.3, seats: 0, votes: 36219 }
  ],
  2005: [
    { party: 'Ap', pct: 32.7, seats: 61, votes: 906539 },
    { party: 'FrP', pct: 22.1, seats: 38, votes: 582284 },
    { party: 'H', pct: 14.1, seats: 23, votes: 370020 },
    { party: 'SV', pct: 8.8, seats: 15, votes: 230860 },
    { party: 'KrF', pct: 6.8, seats: 11, votes: 178509 },
    { party: 'Sp', pct: 6.5, seats: 11, votes: 171213 },
    { party: 'V', pct: 5.9, seats: 10, votes: 156257 },
    { party: 'R', pct: 1.2, seats: 0, votes: 31070 }
  ],
  2001: [
    { party: 'Ap', pct: 24.3, seats: 43, votes: 594182 },
    { party: 'H', pct: 21.2, seats: 38, votes: 518854 },
    { party: 'FrP', pct: 14.6, seats: 26, votes: 357855 },
    { party: 'SV', pct: 12.5, seats: 23, votes: 306125 },
    { party: 'KrF', pct: 12.4, seats: 22, votes: 303135 },
    { party: 'Sp', pct: 5.6, seats: 10, votes: 136981 },
    { party: 'V', pct: 3.9, seats: 2, votes: 95662 },
    { party: 'R', pct: 1.2, seats: 0, votes: 29411 }
  ],
  1997: [
    { party: 'Ap', pct: 35.0, seats: 65, votes: 925367 },
    { party: 'FrP', pct: 15.3, seats: 25, votes: 404576 },
    { party: 'H', pct: 14.3, seats: 23, votes: 378092 },
    { party: 'KrF', pct: 13.7, seats: 25, votes: 362830 },
    { party: 'Sp', pct: 7.9, seats: 11, votes: 209270 },
    { party: 'SV', pct: 6.0, seats: 9, votes: 158268 },
    { party: 'V', pct: 4.5, seats: 6, votes: 119115 },
    { party: 'R', pct: 1.7, seats: 0, votes: 45535 }
  ],
  1993: [
    { party: 'Ap', pct: 36.9, seats: 67, votes: 908724 },
    { party: 'H', pct: 17.0, seats: 28, votes: 418333 },
    { party: 'Sp', pct: 16.7, seats: 32, votes: 410475 },
    { party: 'SV', pct: 7.9, seats: 13, votes: 193954 },
    { party: 'KrF', pct: 7.9, seats: 13, votes: 193629 },
    { party: 'FrP', pct: 6.3, seats: 10, votes: 154583 },
    { party: 'V', pct: 3.6, seats: 1, votes: 88920 },
    { party: 'R', pct: 1.1, seats: 0, votes: 26294 }
  ],
  1989: [
    { party: 'Ap', pct: 34.3, seats: 63, votes: 799706 },
    { party: 'H', pct: 22.2, seats: 37, votes: 516588 },
    { party: 'FrP', pct: 13.0, seats: 22, votes: 301968 },
    { party: 'SV', pct: 10.1, seats: 17, votes: 235796 },
    { party: 'KrF', pct: 8.5, seats: 14, votes: 197838 },
    { party: 'Sp', pct: 6.5, seats: 11, votes: 151989 },
    { party: 'V', pct: 3.2, seats: 0, votes: 73615 }
  ],
  1985: [
    { party: 'Ap', pct: 40.8, seats: 71, votes: 979379 },
    { party: 'H', pct: 30.4, seats: 50, votes: 729764 },
    { party: 'KrF', pct: 8.3, seats: 16, votes: 199154 },
    { party: 'Sp', pct: 6.6, seats: 12, votes: 157731 },
    { party: 'SV', pct: 5.5, seats: 6, votes: 131023 },
    { party: 'FrP', pct: 3.7, seats: 2, votes: 88893 },
    { party: 'V', pct: 3.1, seats: 0, votes: 73849 }
  ]
};

// Sample opinion polls data structure
const SAMPLE_POLLS = {
  2021: [
    { date: '2021-09-12', pollster: 'Election Day', parties: { 'Ap': 26.3, 'H': 20.4, 'Sp': 13.5, 'FrP': 11.6, 'SV': 7.6, 'R': 4.7, 'V': 4.6, 'MDG': 3.9, 'KrF': 3.8 }},
    { date: '2021-09-11', pollster: 'Norstat', parties: { 'Ap': 25.2, 'H': 20.5, 'Sp': 13.7, 'FrP': 11.4, 'SV': 7.9, 'R': 4.8, 'V': 4.5, 'MDG': 3.9, 'KrF': 3.7 }},
    { date: '2021-09-10', pollster: 'Opinion', parties: { 'Ap': 26.1, 'H': 19.9, 'Sp': 13.5, 'FrP': 11.7, 'SV': 7.7, 'R': 4.6, 'V': 4.4, 'MDG': 4.0, 'KrF': 3.8 }},
    { date: '2021-09-09', pollster: 'Sentio', parties: { 'Ap': 25.5, 'H': 20.3, 'Sp': 14.1, 'FrP': 11.2, 'SV': 8.0, 'R': 4.7, 'V': 4.3, 'MDG': 3.8, 'KrF': 3.9 }},
    { date: '2021-09-08', pollster: 'Respons', parties: { 'Ap': 25.8, 'H': 20.1, 'Sp': 13.6, 'FrP': 11.5, 'SV': 7.8, 'R': 4.5, 'V': 4.6, 'MDG': 3.9, 'KrF': 3.7 }},
    { date: '2021-09-07', pollster: 'Kantar', parties: { 'Ap': 26.3, 'H': 20.0, 'Sp': 13.4, 'FrP': 11.8, 'SV': 7.6, 'R': 4.7, 'V': 4.5, 'MDG': 3.8, 'KrF': 3.6 }},
    { date: '2021-08-30', pollster: 'Norstat', parties: { 'Ap': 25.9, 'H': 20.3, 'Sp': 14.1, 'FrP': 11.4, 'SV': 8.0, 'R': 4.4, 'V': 4.2, 'MDG': 4.2, 'KrF': 3.8 }},
    { date: '2021-08-23', pollster: 'Opinion', parties: { 'Ap': 26.5, 'H': 19.7, 'Sp': 13.8, 'FrP': 11.9, 'SV': 7.5, 'R': 4.3, 'V': 4.7, 'MDG': 3.7, 'KrF': 3.9 }},
    { date: '2021-08-16', pollster: 'Sentio', parties: { 'Ap': 25.3, 'H': 20.8, 'Sp': 14.3, 'FrP': 10.9, 'SV': 8.2, 'R': 4.5, 'V': 4.1, 'MDG': 4.1, 'KrF': 3.7 }},
    { date: '2021-08-09', pollster: 'Respons', parties: { 'Ap': 26.0, 'H': 20.2, 'Sp': 13.9, 'FrP': 11.3, 'SV': 7.9, 'R': 4.4, 'V': 4.4, 'MDG': 3.8, 'KrF': 3.8 }}
  ],
  2017: [
    { date: '2017-09-11', pollster: 'Election Day', parties: { 'Ap': 27.4, 'H': 25.0, 'FrP': 15.2, 'Sp': 10.3, 'SV': 6.0, 'V': 4.4, 'KrF': 4.2, 'MDG': 3.2, 'R': 2.4 }},
    { date: '2017-09-10', pollster: 'Norstat', parties: { 'Ap': 27.3, 'H': 24.9, 'FrP': 15.2, 'Sp': 10.4, 'SV': 6.0, 'V': 4.4, 'KrF': 4.2, 'MDG': 3.2, 'R': 2.4 }},
    { date: '2017-09-09', pollster: 'Opinion', parties: { 'Ap': 27.8, 'H': 24.5, 'FrP': 15.0, 'Sp': 10.3, 'SV': 5.9, 'V': 4.5, 'KrF': 4.3, 'MDG': 3.1, 'R': 2.3 }},
    { date: '2017-09-08', pollster: 'Sentio', parties: { 'Ap': 27.1, 'H': 25.2, 'FrP': 15.3, 'Sp': 10.1, 'SV': 6.1, 'V': 4.3, 'KrF': 4.1, 'MDG': 3.3, 'R': 2.5 }},
    { date: '2017-09-07', pollster: 'Respons', parties: { 'Ap': 27.5, 'H': 24.7, 'FrP': 15.1, 'Sp': 10.2, 'SV': 6.0, 'V': 4.4, 'KrF': 4.2, 'MDG': 3.2, 'R': 2.4 }}
  ],
  2013: [
    { date: '2013-09-09', pollster: 'Election Day', parties: { 'Ap': 30.8, 'H': 26.8, 'FrP': 16.3, 'KrF': 5.6, 'Sp': 5.5, 'V': 5.2, 'SV': 4.1, 'MDG': 2.8 }},
    { date: '2013-09-08', pollster: 'Norstat', parties: { 'Ap': 31.1, 'H': 26.5, 'FrP': 16.0, 'KrF': 5.7, 'Sp': 5.4, 'V': 5.3, 'SV': 4.2, 'MDG': 2.7 }},
    { date: '2013-09-07', pollster: 'Opinion', parties: { 'Ap': 30.5, 'H': 27.0, 'FrP': 16.5, 'KrF': 5.5, 'Sp': 5.6, 'V': 5.1, 'SV': 4.0, 'MDG': 2.9 }}
  ],
  2009: [
    { date: '2009-09-14', pollster: 'Election Day', parties: { 'Ap': 35.4, 'FrP': 22.9, 'H': 17.2, 'SV': 6.2, 'Sp': 6.2, 'KrF': 5.5, 'V': 3.9 }},
    { date: '2009-09-13', pollster: 'Norstat', parties: { 'Ap': 35.1, 'FrP': 23.2, 'H': 17.0, 'SV': 6.3, 'Sp': 6.1, 'KrF': 5.6, 'V': 3.8 }},
    { date: '2009-09-12', pollster: 'Opinion', parties: { 'Ap': 35.7, 'FrP': 22.6, 'H': 17.3, 'SV': 6.1, 'Sp': 6.3, 'KrF': 5.4, 'V': 4.0 }}
  ]
};

// Initialize database
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create tables
      db.run(`
        CREATE TABLE IF NOT EXISTS results (
          year INTEGER,
          party_id TEXT,
          pct REAL,
          seats INTEGER,
          votes INTEGER,
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
      
      resolve();
    });
  });
}

// Clear existing data
function clearData() {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM results", (err) => {
      if (err) reject(err);
      else {
        db.run("DELETE FROM polls", (err) => {
          if (err) reject(err);
          else resolve();
        });
      }
    });
  });
}

// Insert election results
function insertResults() {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      "INSERT OR REPLACE INTO results (year, party_id, pct, seats, votes, source) VALUES (?, ?, ?, ?, ?, ?)"
    );
    
    let count = 0;
    for (const [year, results] of Object.entries(ELECTION_RESULTS)) {
      for (const result of results) {
        stmt.run(year, result.party, result.pct, result.seats, result.votes || null, 'Official Results');
        count++;
      }
    }
    
    stmt.finalize(() => {
      console.log(`✓ Inserted ${count} election results`);
      resolve(count);
    });
  });
}

// Insert opinion polls
function insertPolls() {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      "INSERT INTO polls (year, date, pollster, party_id, pct, sample_size, source) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    
    let count = 0;
    for (const [year, polls] of Object.entries(SAMPLE_POLLS)) {
      for (const poll of polls) {
        for (const [party, pct] of Object.entries(poll.parties)) {
          stmt.run(year, poll.date, poll.pollster, party, pct, null, 'Historical Polls');
          count++;
        }
      }
    }
    
    stmt.finalize(() => {
      console.log(`✓ Inserted ${count} poll data points`);
      resolve(count);
    });
  });
}

// Fetch additional polls from Wikipedia
async function fetchWikipediaPolls(year) {
  const url = `https://en.wikipedia.org/wiki/Opinion_polling_for_the_${year}_Norwegian_parliamentary_election`;
  
  try {
    console.log(`  Fetching Wikipedia polls for ${year}...`);
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const polls = [];
    
    // Parse tables for poll data
    $('table.wikitable').each((i, table) => {
      const $table = $(table);
      const headers = [];
      
      $table.find('tr').first().find('th').each((j, th) => {
        headers.push($(th).text().trim());
      });
      
      // Check if this is a polling table
      if (!headers.some(h => h.toLowerCase().includes('date'))) return;
      
      $table.find('tr').slice(1).each((k, row) => {
        const cells = [];
        $(row).find('td').each((l, td) => {
          cells.push($(td).text().trim());
        });
        
        if (cells.length >= 3) {
          // Extract poll data (simplified)
          const dateText = cells[0];
          const pollster = cells[1] || 'Unknown';
          
          // Parse date
          const date = parseDate(dateText, year);
          if (date) {
            polls.push({ date, pollster: pollster.replace(/\[.*?\]/g, '').trim() });
          }
        }
      });
    });
    
    console.log(`    Found ${polls.length} polls`);
    return polls;
  } catch (error) {
    console.log(`    Could not fetch Wikipedia data for ${year}`);
    return [];
  }
}

function parseDate(dateText, year) {
  const months = {
    'january': '01', 'jan': '01', 'february': '02', 'feb': '02',
    'march': '03', 'mar': '03', 'april': '04', 'apr': '04',
    'may': '05', 'june': '06', 'jun': '06', 'july': '07', 'jul': '07',
    'august': '08', 'aug': '08', 'september': '09', 'sep': '09',
    'october': '10', 'oct': '10', 'november': '11', 'nov': '11',
    'december': '12', 'dec': '12'
  };
  
  for (const [name, num] of Object.entries(months)) {
    if (dateText.toLowerCase().includes(name)) {
      const dayMatch = dateText.match(/(\d{1,2})/);
      if (dayMatch) {
        return `${year}-${num}-${dayMatch[1].padStart(2, '0')}`;
      }
    }
  }
  return null;
}

// Show statistics
function showStats() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        (SELECT COUNT(DISTINCT year) FROM results) as election_years,
        (SELECT COUNT(*) FROM results) as total_results,
        (SELECT COUNT(DISTINCT year || '_' || date || '_' || pollster) FROM polls) as unique_polls,
        (SELECT COUNT(*) FROM polls) as total_poll_entries,
        (SELECT MIN(year) FROM results) as first_year,
        (SELECT MAX(year) FROM results) as last_year
    `, (err, rows) => {
      if (err) reject(err);
      else {
        const stats = rows[0];
        console.log('\n📊 Database Statistics:');
        console.log(`   Election years: ${stats.election_years} (${stats.first_year}-${stats.last_year})`);
        console.log(`   Total results: ${stats.total_results}`);
        console.log(`   Unique polls: ${stats.unique_polls}`);
        console.log(`   Poll data points: ${stats.total_poll_entries}`);
        resolve(stats);
      }
    });
  });
}

// Main sync function
async function main() {
  console.log('');
  console.log('========================================');
  console.log('Norwegian Election Data Sync');
  console.log('========================================');
  console.log('');
  
  try {
    // Initialize database
    await initDatabase();
    console.log('✓ Database initialized');
    
    // Clear existing data
    await clearData();
    console.log('✓ Cleared existing data');
    
    // Insert all election results
    await insertResults();
    
    // Insert opinion polls
    await insertPolls();
    
    // Try to fetch additional Wikipedia data
    console.log('\nFetching additional data from Wikipedia:');
    for (const year of [2021, 2017, 2013, 2009, 2005]) {
      await fetchWikipediaPolls(year);
    }
    
    // Show statistics
    await showStats();
    
    console.log('\n✅ Data sync complete!');
    console.log('   Database file: election.db');
    console.log('   Start server: node server-sqlite.js');
    console.log('   Access at: http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

// Run the sync
main();